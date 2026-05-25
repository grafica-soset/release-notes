# Deploy no Google Cloud Run

Guia para publicar o release-notes no **Cloud Run** usando o `Dockerfile` e o
`cloudbuild.yaml` deste repositório.

## Visão geral

- A app é uma SPA + API Nuxt/Nitro. O build gera um servidor Node standalone em
  `.output/server/index.mjs`, iniciado pelo container.
- O Cloud Run injeta a variável `PORT` (8080); o Nitro escuta nela automaticamente.
- Segredos (`MONGODB_URI`, `INTEGRATION_API_KEY`) ficam no **Secret Manager** e são
  montados como variáveis de ambiente no deploy.

## Pré-requisitos (uma vez por projeto)

Defina o projeto e a região:

```bash
export PROJECT_ID=seu-projeto
export REGION=us-central1
export REPO=release-notes
export SERVICE=release-notes
gcloud config set project "$PROJECT_ID"
```

1. **Habilitar as APIs:**

   ```bash
   gcloud services enable \
     run.googleapis.com \
     cloudbuild.googleapis.com \
     artifactregistry.googleapis.com \
     secretmanager.googleapis.com
   ```

2. **Criar o repositório no Artifact Registry:**

   ```bash
   gcloud artifacts repositories create "$REPO" \
     --repository-format=docker \
     --location="$REGION" \
     --description="Imagens do release-notes"
   ```

3. **Criar os segredos** (a chave de integração é opcional — sem ela a API pública
   fica aberta):

   ```bash
   printf 'mongodb+srv://USER:PASS@cluster/release-notes' \
     | gcloud secrets create MONGODB_URI --data-file=-

   printf 'sua-chave-de-integracao' \
     | gcloud secrets create INTEGRATION_API_KEY --data-file=-
   ```

4. **Dar acesso aos segredos** à service account de runtime do Cloud Run
   (por padrão, a Compute Engine default SA):

   ```bash
   PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
   RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

   for S in MONGODB_URI INTEGRATION_API_KEY; do
     gcloud secrets add-iam-policy-binding "$S" \
       --member="serviceAccount:${RUNTIME_SA}" \
       --role="roles/secretmanager.secretAccessor"
   done
   ```

   > A service account do **Cloud Build** também precisa de permissão para fazer o
   > deploy (`roles/run.admin`) e usar a SA de runtime (`roles/iam.serviceAccountUser`).
   > Em projetos novos isso costuma já estar concedido; se o deploy falhar com erro
   > de permissão, conceda esses papéis à SA `${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com`.

## Deploy

### Opção A — build + deploy num comando

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION="$REGION",_REPOSITORY="$REPO",_SERVICE="$SERVICE"
```

O `cloudbuild.yaml` faz: build da imagem → push para o Artifact Registry →
`gcloud run deploy` com os segredos montados.

### Opção B — deploy contínuo (trigger)

Conecte o repositório e crie um trigger apontando para o `cloudbuild.yaml`:

```bash
gcloud builds triggers create github \
  --name=release-notes-main \
  --repo-name=release-notes \
  --repo-owner=SEU_USUARIO \
  --branch-pattern='^main$' \
  --build-config=cloudbuild.yaml \
  --substitutions=_REGION="$REGION",_REPOSITORY="$REPO",_SERVICE="$SERVICE"
```

A cada push na `main`, a imagem é reconstruída e o Cloud Run atualizado.

## Após o deploy

- A URL do serviço aparece no fim do log do deploy (ou
  `gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)'`).
- Health check: `GET <url>/api/health` mostra o estado da conexão com o Mongo.
- O serviço sobe com `--allow-unauthenticated` (app web público). Para restringir,
  remova essa flag do `cloudbuild.yaml` e use IAM/IAP.

## Rodar o container localmente

```bash
docker build -t release-notes .
docker run --rm -p 8080:8080 \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/release-notes" \
  -e INTEGRATION_API_KEY="chave-local" \
  release-notes
# abra http://localhost:8080
```

## Notas e ajustes

- **MongoDB:** use o MongoDB Atlas (ou outro Mongo acessível pela internet) e
  libere o acesso de saída do Cloud Run. Se usar VPC/IP allowlist no Atlas,
  configure um **Serverless VPC Connector** + Cloud NAT com IP fixo.
- **Escala a zero:** o Cloud Run pode escalar para 0 instâncias. A primeira
  requisição após ociosidade paga o cold start + reconexão ao Mongo (já tratada
  por `ensureDb()`). Para evitar, defina `--min-instances=1` no deploy.
- **Região:** ajuste `_REGION` para a mais próxima dos usuários/do banco.
