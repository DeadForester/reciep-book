package dev.recipeservice.web.controller;

import dev.recipeservice.service.recipe.RecipeService;
import dev.recipeservice.web.dto.RecipeRequest;
import dev.recipeservice.web.dto.RecipeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService service;

    @PostMapping
    public ResponseEntity<RecipeResponse> create(
            @RequestBody RecipeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @GetMapping
    public Page<RecipeResponse> getAll(Pageable pageable) {
        return service.findAll(pageable);
    }

    @GetMapping("/{id}")
    public RecipeResponse getById(@PathVariable String id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public RecipeResponse update(
            @PathVariable String id,
            @RequestBody RecipeRequest request) {

        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/image")
    public RecipeResponse uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {

        return service.uploadImage(id, file);
    }
}