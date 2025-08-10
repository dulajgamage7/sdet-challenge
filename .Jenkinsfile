pipeline {
  agent any
  options {
    ansiColor('xterm')
    timestamps()
    skipDefaultCheckout(false)
  }
  environment {
    // Non-secret defaults (safe)
    AWS_DEFAULT_REGION = 'ap-south-1'
    S3_ENDPOINT_URL    = 'http://s3:4566'
    S3_BUCKET_NAME     = 'qna-documents'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git rev-parse --short HEAD'
      }
    }

    stage('Load Secrets & Write .env') {
      steps {
        withCredentials([
          string(credentialsId: 'MONGO_URI',            variable: 'CI_MONGO_URI'),
          string(credentialsId: 'OPENAI_API_KEY',       variable: 'CI_OPENAI_API_KEY'),
          string(credentialsId: 'AWS_ACCESS_KEY_ID',    variable: 'CI_AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'AWS_SECRET_ACCESS_KEY',variable: 'CI_AWS_SECRET_ACCESS_KEY')
        ]) {
          sh '''
            cat > .env <<EOF
MONGO_URI=${CI_MONGO_URI}
ENV=CI
OPENAI_API_KEY=${CI_OPENAI_API_KEY}
AWS_ACCESS_KEY_ID=${CI_AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${CI_AWS_SECRET_ACCESS_KEY}
AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
S3_ENDPOINT_URL=${S3_ENDPOINT_URL}
S3_BUCKET_NAME=${S3_BUCKET_NAME}

# Optional Mongo defaults used by compose
MONGODB_INITDB_ROOT_USERNAME=user
MONGODB_INITDB_ROOT_PASSWORD=pass
EOF
            echo ".env written"
          '''
        }
      }
    }

    stage('Compose Up (app + deps)') {
      steps {
        sh '''
          docker compose version
          docker compose up --build -d app mongodbatlas s3 aws

          # Wait for app on 8000
          for i in $(seq 1 60); do
            if curl -fsS http://localhost:8000/ >/dev/null; then
              echo "App is up"; break
            fi
            echo "Waiting for app... ($i)"; sleep 3
          done
        '''
      }
    }

    stage('Build tests image') {
      steps {
        sh 'docker compose build tests'
      }
    }

    stage('Run Playwright tests (Docker)') {
      steps {
        // tests service runs: npm run playwright:run:allTestsDocker && report:allure:generateDocker
        sh 'docker compose run --rm tests'
      }
    }

    stage('Archive Reports') {
      steps {
        // These paths are bind-mounted back to the workspace by docker-compose
        archiveArtifacts artifacts: 'playwright-test/allure-results/**', allowEmptyArchive: true
        archiveArtifacts artifacts: 'playwright-test/allure-report/**',  allowEmptyArchive: true
        archiveArtifacts artifacts: 'playwright-test/playwright-report/**', allowEmptyArchive: true

        // If Allure plugin installed:
        script {
          try {
            allure includeProperties: false, jdk: '', results: [[path: 'playwright-test/allure-results']]
          } catch (ignored) {
            echo 'Allure plugin not configured; skipping Allure publish.'
          }
        }
      }
    }
  }
  post {
    always {
      sh 'docker compose down -v || true'
      sh 'docker system prune -af || true'
    }
  }
}
