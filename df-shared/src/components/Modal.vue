<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div
        class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
      >
        <button
          type="button"
          class="btn-close"
          @click="close"
          aria-label="Close modal"
        ></button>
        <header class="modal-header" id="modalTitle">
          <slot name="header"><span style="visibility: hidden">title</span></slot>
        </header>
        <section class="modal-body" id="modalDescription">
          <slot name="body"> </slot>
        </section>
        <footer class="modal-footer" v-if="!!this.$slots['footer']">
          <slot name="footer"> </slot>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Modal extends Vue {
  close() {
    this.$emit("close");
  }
}
</script>

<style lang="scss">
.modal-backdrop {
  position: fixed;
  z-index: 1000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
   backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  background-color: rgba(1, 7, 19, 0.5);
}

.modal {
  background: rgba(255,255,255,0.88);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  position: absolute;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  min-width: 400px;
  max-width: 90%;
  max-height: 98%;
  overflow: auto;
}

.modal-header,
.modal-footer {
  padding: 15px;
  display: flex;
}

.modal-header {
  justify-content: space-between;
}

.modal-footer {
  justify-content: flex-end;
}

.modal-body {
  position: relative;
  padding: 20px 15px;
  overflow: auto;
}

.btn-close {
  position: absolute;
  top: 0.25em;
  right: 0.6em;
  border: none;
  padding: 0;
  cursor: pointer;
  background: transparent;
  opacity: 0.8;
  z-index: 99;
  &:before {
    content: "\00D7";
  }
  font-size: 1.7em;
}
</style>
