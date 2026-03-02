package dev.recipeservice.web.mapper;

import dev.recipeservice.entity.Recipe;
import dev.recipeservice.web.dto.RecipeRequest;
import dev.recipeservice.web.dto.RecipeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RecipeMapper {
    Recipe toEntity(RecipeRequest recipeRequest);

    RecipeResponse toDto(Recipe recipe);
}
