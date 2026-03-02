package dev.recipeservice.service.image;

import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final MinioClient minioClient;

    @Value("${app.minio.bucket}")
    private String bucket;

    public String uploadFile(MultipartFile file) {

        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucket)
                            .build());

            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucket)
                                .build());
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(fileName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());

            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(fileName)
                            .build());

        } catch (Exception e) {
            throw new RuntimeException("Error uploading file to MinIO", e);
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            String objectName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

            // Убираем query параметры
            int questionMarkIndex = objectName.indexOf("?");
            if (questionMarkIndex != -1) {
                objectName = objectName.substring(0, questionMarkIndex);
            }

            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build());

        } catch (Exception e) {
            throw new RuntimeException("Error deleting file", e);
        }
    }
}
