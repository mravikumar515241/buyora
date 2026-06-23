package com.buyora.backend.product.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.product.dto.CategoryRequest;
import com.buyora.backend.product.dto.CategoryResponse;
import com.buyora.backend.product.entity.Category;
import com.buyora.backend.product.repository.CategoryRepository;
import com.buyora.backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category cat = new Category();
        cat.setName(request.getName());
        cat.setSlug(request.getName().toLowerCase().replaceAll("\\s+", "-"));
        cat.setDescription(request.getDescription());
        cat = categoryRepository.save(cat);
        return toResponse(cat);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return toResponse(cat);
    }

    public Category getEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        cat.setName(request.getName());
        cat.setSlug(request.getName().toLowerCase().replaceAll("\\s+", "-"));
        if (request.getDescription() != null) {
            cat.setDescription(request.getDescription());
        }
        cat = categoryRepository.save(cat);
        return toResponse(cat);
    }

    @Transactional
    public void delete(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(cat);
    }

    private CategoryResponse toResponse(Category c) {
        long productCount = productRepository.countByCategoryId(c.getId());
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .productCount(productCount)
                .build();
    }
}
