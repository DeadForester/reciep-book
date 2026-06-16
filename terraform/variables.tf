variable "yc_token" {
  description = "Статический ключ доступа (секрет)"
  type        = string
  sensitive   = true
}

variable "yc_cloud_id" {
  description = "ID облака"
  type        = string
}

variable "yc_folder_id" {
  description = "ID каталога"
  type        = string
}

variable "zone" {
  description = "Зона доступности"
  type        = string
  default     = "ru-central1-a"
}

variable "vm_name" {
  description = "Имя виртуальной машины"
  type        = string
  default     = "terraform-vm"
}
