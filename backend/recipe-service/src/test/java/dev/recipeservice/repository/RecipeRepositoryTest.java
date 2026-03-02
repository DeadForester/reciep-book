package dev.recipeservice.repository;

import dev.recipeservice.entity.Recipe;
import dev.recipeservice.repository.recipe.RecipeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataMongoTest
class RecipeRepositoryTest {

    @Autowired
    private RecipeRepository repository;

    @Test
    void shouldSaveRecipe() {
        Recipe recipe = new Recipe();
        recipe.setTitle("Pasta");

        Recipe saved = repository.save(recipe);

        assertThat(saved.getId()).isNotNull();
    }
}