// grid grid-cols-12 col-span-12 hidden border-0 outline-0 py-3 py-5
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
