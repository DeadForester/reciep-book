package dev.recipeservice.web.dto;

import dev.recipeservice.entity.Difficulty;

import java.time.Instant;
import java.util.List;

public record RecipeResponse(
        String id,
        String title,
        String description,
        List<String> ingredients,
        List<String> steps,
        Integer cookingTimeMinutes,
        Difficulty difficulty,
        String imageUrl,
        Instant createdAt
) {}
