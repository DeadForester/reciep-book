package dev.recipeservice.service.recipe;

import dev.recipeservice.entity.Difficulty;
import dev.recipeservice.entity.Recipe;
import dev.recipeservice.exception.NotFoundException;
import dev.recipeservice.repository.recipe.RecipeRepository;
import dev.recipeservice.service.image.ImageService;
import dev.recipeservice.web.dto.RecipeRequest;
import dev.recipeservice.web.dto.RecipeResponse;
import dev.recipeservice.web.mapper.RecipeMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    private RecipeRepository repository;

    @Mock
    private RecipeMapper mapper;

    @Mock
    private ImageService imageService;

    @InjectMocks
    private RecipeService recipeService;

    private Recipe recipe;
    private RecipeRequest request;
    private RecipeResponse response;

    @BeforeEach
    void setUp() {
        recipe = new Recipe();
        recipe.setId("test-id");
        recipe.setTitle("Test Recipe");
        recipe.setDescription("Test Description");
        recipe.setIngredients(List.of("ingredient1", "ingredient2"));
        recipe.setSteps(List.of("step1", "step2"));
        recipe.setCookingTimeMinutes(30);
        recipe.setDifficulty(Difficulty.EASY);
        recipe.setCreatedAt(Instant.now());
        recipe.setUpdatedAt(Instant.now());

        request = new RecipeRequest(
                "Updated Title",
                "Updated Description",
                List.of("new ingredient"),
                List.of("new step"),
                45,
                Difficulty.MEDIUM
        );

        response = new RecipeResponse(
                "test-id",
                "Test Recipe",
                "Test Description",
                List.of("ingredient1"),
                List.of("step1"),
                30,
                Difficulty.EASY,
                null,
                Instant.now()
        );
    }

    @Test
    void create_ShouldMapToEntityAndSave() {
        // Given
        when(mapper.toEntity(any(RecipeRequest.class))).thenReturn(recipe);
        when(repository.save(any(Recipe.class))).thenReturn(recipe);
        when(mapper.toDto(any(Recipe.class))).thenReturn(response);

        // When
        RecipeResponse result = recipeService.create(request);

        // Then
        assertNotNull(result);
        verify(mapper, times(1)).toEntity(request);
        verify(repository, times(1)).save(any(Recipe.class));
        verify(mapper, times(1)).toDto(recipe);
    }

    @Test
    void findAll_ShouldReturnPageOfRecipes() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Recipe> recipePage = new PageImpl<>(List.of(recipe));
        Page<RecipeResponse> responsePage = new PageImpl<>(List.of(response));

        when(repository.findAll(pageable)).thenReturn(recipePage);
        when(mapper.toDto(recipe)).thenReturn(response);

        // When
        Page<RecipeResponse> result = recipeService.findAll(pageable);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(repository, times(1)).findAll(pageable);
        verify(mapper, times(1)).toDto(recipe);
    }

    @Test
    void findAll_ShouldReturnEmptyPage_WhenNoRecipes() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Recipe> emptyPage = new PageImpl<>(Collections.emptyList());

        when(repository.findAll(pageable)).thenReturn(emptyPage);

        // When
        Page<RecipeResponse> result = recipeService.findAll(pageable);

        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
    }

    @Test
    void findById_ShouldReturnRecipe_WhenExists() {
        // Given
        String id = "test-id";
        when(repository.findById(id)).thenReturn(Optional.of(recipe));
        when(mapper.toDto(recipe)).thenReturn(response);

        // When
        RecipeResponse result = recipeService.findById(id);

        // Then
        assertNotNull(result);
        assertEquals(response, result);
        verify(repository, times(1)).findById(id);
        verify(mapper, times(1)).toDto(recipe);
    }

    @Test
    void findById_ShouldThrowNotFoundException_WhenNotExists() {
        // Given
        String id = "non-existent-id";
        when(repository.findById(id)).thenReturn(Optional.empty());

        // When & Then
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            recipeService.findById(id);
        });

        assertEquals("Рецепт не найден", exception.getMessage());
        verify(repository, times(1)).findById(id);
        verify(mapper, never()).toDto(any());
    }

    @Test
    void update_ShouldUpdateAllFields_WhenAllProvided() {
        // Given
        String id = "test-id";
        Recipe updatedRecipe = new Recipe();
        updatedRecipe.setId(id);
        updatedRecipe.setTitle("Updated Title");
        updatedRecipe.setDescription("Updated Description");
        updatedRecipe.setIngredients(List.of("new ingredient"));
        updatedRecipe.setSteps(List.of("new step"));
        updatedRecipe.setCookingTimeMinutes(45);
        updatedRecipe.setDifficulty(Difficulty.MEDIUM);

        when(repository.findById(id)).thenReturn(Optional.of(recipe));
        when(repository.save(any(Recipe.class))).thenReturn(updatedRecipe);
        when(mapper.toDto(updatedRecipe)).thenReturn(response);

        // When
        RecipeResponse result = recipeService.update(id, request);

        // Then
        assertNotNull(result);
        verify(repository, times(1)).findById(id);
        verify(repository, times(1)).save(any(Recipe.class));
        verify(mapper, times(1)).toDto(any(Recipe.class));
    }

    @Test
    void update_ShouldUpdateOnlyProvidedFields_WhenSomeAreNull() {
        // Given
        String id = "test-id";
        RecipeRequest partialRequest = new RecipeRequest(
                "Updated Title",
                "Updated Description",
                List.of("new ingredient"),
                null,  // steps is null
                null,  // cookingTimeMinutes is null
                null   // difficulty is null
        );

        when(repository.findById(id)).thenReturn(Optional.of(recipe));
        when(repository.save(any(Recipe.class))).thenReturn(recipe);
        when(mapper.toDto(recipe)).thenReturn(response);

        // When
        RecipeResponse result = recipeService.update(id, partialRequest);

        // Then
        assertNotNull(result);
        assertEquals("Updated Title", recipe.getTitle());
        assertEquals("Updated Description", recipe.getDescription());
        assertEquals(List.of("new ingredient"), recipe.getIngredients());
        // These should remain unchanged (not null)
        assertNotNull(recipe.getSteps());
        assertNotNull(recipe.getCookingTimeMinutes());
        assertNotNull(recipe.getDifficulty());
    }

    @Test
    void update_ShouldThrowNotFoundException_WhenNotExists() {
        // Given
        String id = "non-existent-id";
        when(repository.findById(id)).thenReturn(Optional.empty());

        // When & Then
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            recipeService.update(id, request);
        });

        assertEquals("Рецепт не найден", exception.getMessage());
        verify(repository, times(1)).findById(id);
        verify(repository, never()).save(any());
    }

    @Test
    void deleteById_ShouldDeleteRecipeAndImage_WhenImageExists() {
        // Given
        String id = "test-id";
        recipe.setImageUrl("/images/test-image.jpg");

        when(repository.findById(id)).thenReturn(Optional.of(recipe));

        // When
        recipeService.deleteById(id);

        // Then
        verify(repository, times(1)).findById(id);
        verify(imageService, times(1)).deleteFile("/images/test-image.jpg");
        verify(repository, times(1)).delete(recipe);
    }

    @Test
    void deleteById_ShouldDeleteRecipeWithoutImage_WhenNoImage() {
        // Given
        String id = "test-id";
        recipe.setImageUrl(null);

        when(repository.findById(id)).thenReturn(Optional.of(recipe));

        // When
        recipeService.deleteById(id);

        // Then
        verify(repository, times(1)).findById(id);
        verify(imageService, never()).deleteFile(anyString());
        verify(repository, times(1)).delete(recipe);
    }

    @Test
    void deleteById_ShouldThrowNotFoundException_WhenNotExists() {
        // Given
        String id = "non-existent-id";
        when(repository.findById(id)).thenReturn(Optional.empty());

        // When & Then
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            recipeService.deleteById(id);
        });

        assertEquals("Рецепт не найден", exception.getMessage());
        verify(repository, times(1)).findById(id);
        verify(imageService, never()).deleteFile(anyString());
        verify(repository, never()).delete(any());
    }

    @Test
    void uploadImage_ShouldUploadNewImage_WhenNoExistingImage() {
        // Given
        String id = "test-id";
        recipe.setImageUrl(null);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test content".getBytes()
        );
        String imageUrl = "/images/new-image.jpg";
        Recipe updatedRecipe = new Recipe();
        updatedRecipe.setId(id);
        updatedRecipe.setImageUrl(imageUrl);

        when(repository.findById(id)).thenReturn(Optional.of(recipe));
        when(imageService.uploadFile(file)).thenReturn(imageUrl);
        when(repository.save(recipe)).thenReturn(updatedRecipe);
        when(mapper.toDto(updatedRecipe)).thenReturn(response);

        // When
        RecipeResponse result = recipeService.uploadImage(id, file);

        // Then
        assertNotNull(result);
        verify(repository, times(1)).findById(id);
        verify(imageService, never()).deleteFile(anyString());
        verify(imageService, times(1)).uploadFile(file);
        assertEquals(imageUrl, recipe.getImageUrl());
        verify(repository, times(1)).save(recipe);
    }

    @Test
    void uploadImage_ShouldDeleteOldAndUploadNew_WhenImageExists() {
        // Given
        String id = "test-id";
        recipe.setImageUrl("/images/old-image.jpg");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "new.jpg",
                "image/jpeg",
                "new content".getBytes()
        );
        String newImageUrl = "/images/new-image.jpg";
        Recipe updatedRecipe = new Recipe();
        updatedRecipe.setId(id);
        updatedRecipe.setImageUrl(newImageUrl);

        when(repository.findById(id)).thenReturn(Optional.of(recipe));
        when(imageService.uploadFile(file)).thenReturn(newImageUrl);
        when(repository.save(recipe)).thenReturn(updatedRecipe);
        when(mapper.toDto(updatedRecipe)).thenReturn(response);

        // When
        RecipeResponse result = recipeService.uploadImage(id, file);

        // Then
        assertNotNull(result);
        verify(repository, times(1)).findById(id);
        verify(imageService, times(1)).deleteFile("/images/old-image.jpg");
        verify(imageService, times(1)).uploadFile(file);
        assertEquals(newImageUrl, recipe.getImageUrl());
        verify(repository, times(1)).save(recipe);
    }

    @Test
    void uploadImage_ShouldThrowNotFoundException_WhenNotExists() {
        // Given
        String id = "non-existent-id";
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test content".getBytes()
        );

        when(repository.findById(id)).thenReturn(Optional.empty());

        // When & Then
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            recipeService.uploadImage(id, file);
        });

        assertEquals("Рецепт не найден", exception.getMessage());
        verify(repository, times(1)).findById(id);
        verify(imageService, never()).uploadFile(any());
        verify(imageService, never()).deleteFile(anyString());
    }
}