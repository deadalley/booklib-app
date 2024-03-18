<template>
  <ClientOnly>
    <Vueform>
      <GroupElement name="container">
        <BlInput
          name="title"
          label="Title"
          placeholder="Title"
          value="Valyue 123"
          :columns="2"
        >
        </BlInput>
        <BlInput
          editing
          name="title"
          label="Title"
          placeholder="Title"
          value="Valyue 123"
          :columns="10"
        >
        </BlInput>
      </GroupElement>
    </Vueform>
  </ClientOnly>
</template>

<script setup lang="ts"></script>
