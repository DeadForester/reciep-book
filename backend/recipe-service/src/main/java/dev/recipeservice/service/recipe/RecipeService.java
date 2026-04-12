package dev.recipeservice.service.recipe;

import dev.recipeservice.entity.Recipe;
import dev.recipeservice.exception.NotFoundException;
import dev.recipeservice.repository.recipe.RecipeRepository;
import dev.recipeservice.service.image.ImageService;
import dev.recipeservice.web.dto.RecipeRequest;
import dev.recipeservice.web.dto.RecipeResponse;
import dev.recipeservice.web.mapper.RecipeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository repository;
    private final RecipeMapper mapper;
    private final ImageService imageService;

    public RecipeResponse create(RecipeRequest request) {

        Recipe recipe = mapper.toEntity(request);
        recipe.setCreatedAt(Instant.now());
        recipe.setUpdatedAt(Instant.now());

        return mapper.toDto(repository.save(recipe));
    }

    public Page<RecipeResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toDto);
    }

    public RecipeResponse findById(String id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("Рецепт не найден"));
    }

    public RecipeResponse update(String id, RecipeRequest request) {

        Recipe recipe = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Рецепт не найден"));

        recipe.setTitle(request.title());
        recipe.setDescription(request.description());
        recipe.setIngredients(request.ingredients());

        if (request.steps() != null) {
            recipe.setSteps(request.steps());
        }
        if (request.cookingTimeMinutes() != null) {
            recipe.setCookingTimeMinutes(request.cookingTimeMinutes());
        }
        if (request.difficulty() != null) {
            recipe.setDifficulty(request.difficulty());
        }

        recipe.setUpdatedAt(Instant.now());

        return mapper.toDto(repository.save(recipe));
    }

    public void deleteById(String id) {

        Recipe recipe = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Рецепт не найден"));

        if (recipe.getImageUrl() != null) {
            imageService.deleteFile(recipe.getImageUrl());
        }

        repository.delete(recipe);
    }

    public RecipeResponse uploadImage(String id, MultipartFile file) {

        Recipe recipe = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Рецепт не найден"));

        if (recipe.getImageUrl() != null) {
            imageService.deleteFile(recipe.getImageUrl());
        }

        String imageUrl = imageService.uploadFile(file);
        recipe.setImageUrl(imageUrl);

        return mapper.toDto(repository.save(recipe));
    }
}