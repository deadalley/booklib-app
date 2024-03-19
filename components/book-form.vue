<template>
  <ClientOnly>
    <Vueform endpoint="/book" method="post">
      <section>
        <h4>Overview</h4>
        <bl-input name="title" label="Title" placeholder="Title" />
        <div name="container" class="form-row">
          <bl-input
            name="publisher"
            label="Publisher"
            placeholder="Publisher"
            :columns="6"
          />
          <bl-input
            name="language"
            label="Language"
            placeholder="Language"
            :columns="6"
          />
        </div>
        <div name="container" class="form-row">
          <bl-input
            name="year"
            label="Year"
            placeholder="Year"
            input-type="number"
            :columns="6"
          />
          <bl-input
            name="pages"
            label="Pages"
            placeholder="Pages"
            input-type="number"
            :columns="6"
          />
        </div>
        <div name="container" class="form-row">
          <bl-input
            name="originalTitle"
            label="Original Title"
            placeholder="Original Title"
            :columns="6"
          />
          <bl-input
            name="originalLanguage"
            label="Original Language"
            placeholder="Original Language"
            :columns="6"
          />
        </div>
        <bl-input
          name="isbn"
          label="ISBN"
          placeholder="ISBN"
          input-type="number"
        />
        <bl-textarea-input
          name="summary"
          label="Summary"
          placeholder="Summary"
          :rows="4"
        />
      </section>
      <div class="flex gap-2 justify-end col-span-12">
        <bl-button compact variant="secondary">Discard</bl-button>
        <bl-button compact type="submit">Save</bl-button>
      </div>
    </Vueform>
  </ClientOnly>
</template>

<script setup lang="ts"></script>
