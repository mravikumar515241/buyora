package com.buyora.backend.user.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.user.dto.AddressRequest;
import com.buyora.backend.user.dto.AddressResponse;
import com.buyora.backend.user.entity.Address;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.AddressRepository;
import com.buyora.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressResponse getAddressById(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        return toResponse(address);
    }

    @Transactional(readOnly = true)
    public AddressResponse getDefaultAddress(Long userId) {
        Address address = addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No default address found"));
        return toResponse(address);
    }

    @Transactional
    public AddressResponse createAddress(AddressRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address address = new Address();
        address.setUser(user);
        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setStreetAddress(request.getStreetAddress());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setCountry(request.getCountry());
        address.setLabel(request.getLabel());
        address.setIsDefault(request.getIsDefault() != null && request.getIsDefault());

        // If this is the first address, make it default
        long existingCount = addressRepository.countByUserId(userId);
        if (existingCount == 0) {
            address.setIsDefault(true);
        }

        // If setting as default, clear other defaults
        if (address.getIsDefault()) {
            addressRepository.clearDefaultForUser(userId);
        }

        Address saved = addressRepository.save(address);
        log.info("Address created for user: {}", userId);
        
        return toResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(Long addressId, AddressRequest request, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setStreetAddress(request.getStreetAddress());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setCountry(request.getCountry());
        address.setLabel(request.getLabel());

        // If setting as default, clear other defaults
        boolean wasDefault = address.getIsDefault();
        boolean newDefault = request.getIsDefault() != null && request.getIsDefault();
        
        if (newDefault && !wasDefault) {
            addressRepository.clearDefaultForUser(userId);
        }
        
        address.setIsDefault(newDefault);

        Address saved = addressRepository.save(address);
        log.info("Address updated: {}", addressId);
        
        return toResponse(saved);
    }

    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);
        log.info("Address deleted: {}", addressId);

        // If deleted address was default, set another as default
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
                log.info("New default address set: {}", newDefault.getId());
            }
        }
    }

    @Transactional
    public AddressResponse setDefaultAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        // Clear all defaults for this user
        addressRepository.clearDefaultForUser(userId);

        // Set this as default
        address.setIsDefault(true);
        Address saved = addressRepository.save(address);
        log.info("Default address set: {}", addressId);

        return toResponse(saved);
    }

    private AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .streetAddress(address.getStreetAddress())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .country(address.getCountry())
                .label(address.getLabel())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
