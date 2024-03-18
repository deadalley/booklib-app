<script setup lang="ts">
useHead({
  title: 'BookLib',
})

const user = useSupabaseUser()

if (user.value) {
  navigateTo('/library')
} else {
  navigateTo('/login')
}
</script>
