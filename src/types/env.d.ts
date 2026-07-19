interface ImportMetaEnv {
  readonly USER_NAME: string;
  readonly REPO_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
