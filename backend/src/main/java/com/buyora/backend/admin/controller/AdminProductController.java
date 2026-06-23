package com.buyora.backend.admin.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.product.dto.ProductResponse;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductResponse> products;
        
        if (status != null && !status.isEmpty()) {
            Product.ProductStatus productStatus = Product.ProductStatus.valueOf(status);
            products = productService.findByStatus(productStatus, pageable);
        } else {
            // Return all products (no status filter) - we'll need to add this method
            products = productService.findAll(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Products retrieved", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved", product));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ProductResponse>> approve(@PathVariable Long id) {
        ProductResponse product = productService.approveProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product approved", product));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ProductResponse>> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String rejectionReason = body != null ? body.get("rejectionReason") : null;
        ProductResponse product = productService.rejectProduct(id, rejectionReason);
        return ResponseEntity.ok(ApiResponse.success("Product rejected", product));
    }

    @PatchMapping("/{id}/request-modification")
    public ResponseEntity<ApiResponse<ProductResponse>> requestModification(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String comments = body.get("comments");
        ProductResponse product = productService.requestModification(id, comments);
        return ResponseEntity.ok(ApiResponse.success("Modification requested", product));
    }
}
