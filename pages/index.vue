<script setup lang="ts">
useHead({
  title: 'BookLib',
})

const user = useSupabaseUser()

if (user.value) {
  navigateTo('/dashboard')
} else {
  navigateTo('/login')
}
</script>
