package dev.recipeservice.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import dev.recipeservice.entity.Difficulty;

import java.time.Instant;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
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
