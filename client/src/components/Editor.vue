<template>
  <div id="editor" ref="wrapper" />
</template>

<script>
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default {
  name: "Editor",
  data() {
    return {
      quill: null,
    };
  },
  mounted() {
    const wrapper = this.$refs.wrapper;

    if (!wrapper) return;

    wrapper.innerHTML = "";

    const editor = document.createElement("div");

    wrapper.append(editor);

    const quill = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });

    quill.disable();
    quill.setText("Loading...");

    this.quill = quill;

    this.setupQuillEvents();

    this.$emit('ready');
  },
  beforeDestroy() {
    this.cleanupQuillEvents();
  },
  methods: {
    setupQuillEvents() {
      if (!this.quill) return;

      this.quill.on('text-change', this.handleTextChange);
    },
    cleanupQuillEvents() {
      if (!this.quill) return;

      this.quill.off('text-change', this.handleTextChange);
    },
    handleTextChange(delta, oldDelta, source) {
      this.$emit('text-change', { delta, oldDelta, source });
    }
  },
};
</script>

<style>
</style>