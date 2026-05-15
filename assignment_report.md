# Assignment 3: CI/CD Pipeline Implementation Report

**Name:** [Your Name]
**Registration Number:** [Your Reg No]

## 1. Application Overview
For this assignment, a lightweight "Task Manager" web application was developed using **Node.js (Express)** for the backend API and **MongoDB** as the Database Server. The frontend is built using standard HTML/CSS/JavaScript and dynamically interacts with the Express API.

## 2. Configuration and Setup on AWS EC2
**EC2 Instance Details:**
- **Instance ID:** `i-0139b55c279631b70`
- **Public IP:** `3.94.168.107`

### Step 2.1: Connect to EC2
```bash
ssh -i "your-key.pem" ubuntu@3.94.168.107
```

### Step 2.2: Install Docker & Jenkins
```bash
# Update packages
sudo apt update -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Java (Jenkins requirement)
sudo apt install openjdk-17-jre -y

# Install Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update -y
sudo apt-get install jenkins -y
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Add jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```
*(Screenshot required: Show Jenkins dashboard or initial setup page at `http://3.94.168.107:8080`)*

## 3. GitHub Integration and Webhook
- **Repository:** Created a GitHub repository and pushed the web application code.
- **Webhook Configuration:** 
  1. In GitHub repo settings > Webhooks > Add Webhook.
  2. Payload URL: `http://3.94.168.107:8080/github-webhook/`
  3. Content type: `application/json`
  4. Events: Push events.
*(Screenshot required: Show the GitHub Webhook settings page showing a green checkmark)*

## 4. Jenkins Pipeline Stages
The Jenkins pipeline (`Jenkinsfile`) automates the following CI/CD phases:

### 4.1 Code Build Stage
Built two Docker images:
- The main web application image (`Dockerfile`)
- The selenium testing image with Node dependencies (`Dockerfile.selenium`)

### 4.2 Unit Testing Stage
Developed unit tests using `jest`. Tested the MongoDB Schema constraints using a temporary dockerized node container.

**Unit Test Script (`test/unit.test.js`):**
```javascript
const mongoose = require('mongoose');
const { Task } = require('../app');

describe('Task Model Test', () => {
    it('should create a task successfully', () => {
        const task = new Task({ title: 'Test Task' });
        expect(task.title).toBe('Test Task');
        expect(task.completed).toBe(false);
    });
});
```

### 4.3 Containerized Deployment Stage
Used `docker-compose.yml` to spin up:
- MongoDB Container
- Web Application Container
- Selenium Standalone Chrome Hub Container

### 4.4 Containerized Selenium Testing Stage
Automated UI tests using `selenium-webdriver`. The tests verify the UI rendering and functional behavior (adding a task) against the deployed application.

**Selenium Test Cases (`test/selenium.test.js`):**
1. **Title Verification:** Verifies the page loads correctly and reads "Task Manager - Assignment 3".
2. **Form Interaction:** Types a task into the input box, clicks "Add Task", and verifies the task appears in the list.

## 5. Script Attachments

### Dockerfile (Web App)
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Dockerfile.selenium
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "test:selenium"]
```

### Jenkinsfile
```groovy
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
                sh 'docker run --rm -v ${WORKSPACE}:/usr/src/app -w /usr/src/app node:18-alpine sh -c "npm install && npm test"'
            }
        }

        stage('Containerized Deployment stage') {
            steps {
                echo 'Deploying Application and Database using Docker Compose...'
                sh 'docker-compose up -d --build'
                sh 'sleep 15'
            }
        }

        stage('Containerized Selenium Testing stage') {
            steps {
                echo 'Running Containerized Selenium Tests...'
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
            sh 'docker-compose down'
            sh 'docker rmi ${APP_IMAGE} || true'
            sh 'docker rmi ${TEST_IMAGE} || true'
        }
    }
}
```

*(Screenshot required: Show the successful Jenkins pipeline build logs indicating all stages completed)*
