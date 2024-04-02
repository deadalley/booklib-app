<script setup lang="ts">
useHead({
  title: 'BookLib',
})

const user = useSupabaseUser()

if (user.value) {
  navigateTo('/home')
} else {
  navigateTo('/login')
}
</script>
