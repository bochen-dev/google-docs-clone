<template>
  <div class="document">
    <Editor
      ref="editor"
      v-model="content"
      @ready="onEditorReady"
      @text-change="onTextChanged"
    />
  </div>
</template>

<script>
import Editor from "@/components/Editor.vue";
import { io } from "socket.io-client";

export default {
  name: "Document",
  components: {
    Editor,
  },
  data() {
    return {
      editorReady: false,
      socket: null,
      content: "",
      saveInterval: null
    };
  },
  beforeDestroy() {
    this.socket?.disconnect();

    clearInterval(this.saveInterval);
    this.saveInterval = null;
  },
  methods: {
    onEditorReady() {
      console.warn(`Editor is ready, initiate socket.io connection`);
      this.editorReady = true;

      this.initiateSocketConnection();

      this.getDocumentContent();

      this.setSaveContentInterval();
    },
    initiateSocketConnection() {
      this.socket = io(process.env.VUE_APP_SOCKET_IO_SERVER);

      this.setupSocket();
    },
    setupSocket() {
      if (!this.socket) return;

      console.warn(`Setup socket`);

      this.socket.on("receive-changes", this.onReceiveChanges);
    },
    onTextChanged({ delta, oldDelta, source }) {
      if (!this.socket) return;
      if (source !== "user") return;

      this.socket.emit("send-changes", delta);
    },
    onReceiveChanges(delta) {
      if (!this.$refs.editor) return;

      this.$refs.editor?.quill?.updateContents(delta);
    },
    getDocumentContent() {
      if (!this.socket || !this.editorReady) return;

      this.socket.once('load-document', (content) => {
        this.$refs.editor.quill.setContents(content);
        this.$refs.editor.quill.enable();
      })

      this.socket.emit("get-document", this.$route.params.id);
    },
    setSaveContentInterval() {
      if (!this.socket || !this.editorReady) return;

      this.saveInterval = setInterval(() => {
        this.socket.emit('save-document', this.$refs.editor.quill.getContents());
      }, 2000);
    }
  },
};
</script>

<style lang="scss">
.document .ql-editor {
  position: relative;
  width: 8.5in;
  min-height: 11in;
  padding: 1in;
  margin: 1rem;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
  background: white;

  &.ql-blank::before {
    left: 1in;
    right: 1in;
  }
}

.document .ql-container.ql-snow {
  border: none;
  display: flex;
  justify-content: center;
}

.document .ql-toolbar.ql-snow {
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #f3f3f3;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
}

@page {
  margin: 1in;
}

@media print {
  .document .ql-editor {
    width: 6.5in;
    height: 9in;
    padding: 0;
    margin: 0;
    box-shadow: none;
    align-self: flex-start;
  }

  .document .ql-toolbar.ql-snow {
    display: none;
  }
}
</style>