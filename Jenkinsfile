pipeline {
    agent any

    environment {
        APP_IMAGE = "taskmanager-webapp:${env.BUILD_ID}"
        TEST_IMAGE = "taskmanager-selenium:${env.BUILD_ID}"
    }

    stages {
        stage('Code Build stage') {
            steps {
                echo 'Building Web Application and Selenium Test Docker Images...'
                sh 'docker build -t ${APP_IMAGE} -f Dockerfile .'
                sh 'docker build -t ${TEST_IMAGE} -f Dockerfile.selenium .'
            }
        }

        stage('Unit Testing stage') {
            steps {
                echo 'Running Unit Tests using Jest...'
                // Run unit tests inside a temporary node container
                sh 'docker run --rm -v ${WORKSPACE}:/usr/src/app -w /usr/src/app node:18-alpine sh -c "npm install && npm test"'
            }
        }

        stage('Containerized Deployment stage') {
            steps {
                echo 'Deploying Application and Database using Docker Compose...'
                // Spin up MongoDB, WebApp, and Selenium-Hub
                sh 'docker-compose up -d --build'
                
                // Wait for the application to be ready
                echo 'Waiting for services to start...'
                sh 'sleep 15'
            }
        }

        stage('Containerized Selenium Testing stage') {
            steps {
                echo 'Running Containerized Selenium Tests...'
                // Run the Selenium tests container against the deployed application
                // Passing the network and environment variables to connect to selenium-hub and webapp
                sh '''
                docker run --rm --network assignment-3_app-network \
                -e APP_URL=http://webapp:3000 \
                -e SELENIUM_HUB_URL=http://selenium-hub:4444/wd/hub \
                ${TEST_IMAGE}
                '''
            }
        }
    }

    post {
        always {
            echo 'Cleaning up environment...'
            sh 'docker-compose down'
            sh 'docker rmi ${APP_IMAGE} || true'
            sh 'docker rmi ${TEST_IMAGE} || true'
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline execution failed!'
        }
    }
}
