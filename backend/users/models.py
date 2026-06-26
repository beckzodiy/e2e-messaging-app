from django.db import models
from django.contrib.auth.models import User
import nacl.utils
import nacl.public

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    public_key = models.TextField()
    private_key_encrypted = models.TextField()
    avatar = models.URLField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[('online', 'Online'), ('offline', 'Offline'), ('away', 'Away')],
        default='offline'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    contact = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacted_by')
    added_at = models.DateTimeField(auto_now_add=True)
    blocked = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'contact')

    def __str__(self):
        return f"{self.user.username} -> {self.contact.username}"
