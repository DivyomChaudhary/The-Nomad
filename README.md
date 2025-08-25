# The Nomad 🏞️

A modern and responsive blog application designed for content creators. The Nomad provides a simple, clean interface for writing and sharing blog posts, powered by a robust and scalable cloud infrastructure.

## ✨ Features

* **User Authentication:** Secure user registration and login functionalities.
* **Multi-Page Application (MPA):** Each primary navigation link (e.g., Hero page, Blog listing, Register page, New Blog page) serves a distinct HTML page from the server, enhancing traditional web navigation.
* **Intuitive UI:** A clean and easy-to-use interface for both authors and readers.
* **High-Performance Assets:** All static content, including images, CSS files, and client-side JavaScript, is served directly from a high-performance cloud object storage (Amazon S3) for faster load times.

---

## 💻 Technologies

### Frontend
* **HTML5**: For structuring the web content.
* **CSS3**: For styling the application, ensuring a responsive and visually appealing design.
* **JavaScript**: For interactive client-side functionalities.
* **Bootstrap**: A popular open-source CSS framework for developing responsive and mobile-first websites.

### Backend
* **Node.js**: The server-side runtime environment for executing JavaScript.
* **Express.js**: A fast, unopinionated, minimalist web framework for Node.js, used to build the application's API and handle server-side routing.
* **EJS (Embedded JavaScript)**: A simple templating language that lets you generate HTML markup with plain JavaScript. It's used on the server to render dynamic web pages.

### Database
* **MongoDB Atlas**: A cloud-based NoSQL database service, used to store blog posts, user data, and other application-specific information.

### Infrastructure & Deployment
* **AWS EC2 (Elastic Compute Cloud)**: A virtual server instance where the Node.js Express application runs. It handles all server-side logic and dynamic page rendering.
* **Amazon S3 (Simple Storage Service)**: Used exclusively for storing and serving static assets like images, CSS, and client-side JavaScript files. This offloads static content delivery from the EC2 instance, improving performance.
* **PM2**: A production process manager for Node.js applications, used on the EC2 instance to keep the application alive indefinitely, automatically restart it after crashes, and manage server-side logging.
* **VPC (Virtual Private Cloud)**: A logically isolated section of the AWS Cloud where all your AWS resources (EC2, S3) are launched, providing a secure and private network environment.
* **Amazon Route 53**: A highly available and scalable cloud Domain Name System (DNS) web service, used to manage the application's custom domain name and route traffic to the EC2 instance via an Elastic IP.
* **Elastic IP (EIP)**: A static IPv4 address designed for dynamic cloud computing, providing a fixed public IP for the EC2 instance, which simplifies DNS configuration.

---

## ⚙️ Local Installation

Follow these steps to get a copy of the project up and running on your local machine for development and testing purposes.

1.  **Clone the Repository**
    Open your terminal or command prompt and run the following command to clone the project:
    ```bash
    git clone https://github.com/DivyomChaudhary/The-Nomad.git
    cd the-nomad
    ```

2.  **Install Dependencies**
    Navigate into the project directory and install all required Node.js packages:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a file named `.env` in the root of your project directory. This file will store sensitive configuration details, such as your database connection string and AWS credentials.
    ```
    # MongoDB Atlas Connection String
    MONGODB_URI=<your_mongodb_atlas_connection_string>

    # AWS S3 Configuration (for dynamic URL generation)
    AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
    AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
    AWS_REGION=<your_s3_bucket_region>
    S3_BUCKET_NAME=<your_s3_bucket_name>
    ```
    Replace the placeholder values with your actual credentials and bucket details.

4.  **Run the Application**
    Start the Node.js Express application in development mode:
    ```bash
    npm start
    ```
    Your application will typically be accessible in your web browser at `http://localhost:3000`.

---

## 🚀 Deployment to AWS

The Nomad application is designed for deployment on AWS, leveraging EC2 for the backend and S3 for static content.

### Prerequisites
* An active AWS account.
* AWS CLI configured with appropriate credentials.
* An EC2 instance set up (e.g., Ubuntu, Amazon Linux) with Node.js and PM2 installed.
* An S3 bucket created for static asset storage.
* An Elastic IP address associated with your EC2 instance.
* A registered domain name managed by Amazon Route 53.

### Deployment Steps

1.  **Push Latest Code to Git:**
    Ensure all your local changes, including the updated S3 URLs for static assets and the `/` to `/main` redirect, are committed and pushed to your Git repository (e.e.g., GitHub, GitLab, Bitbucket).
    ```bash
    git add .
    git commit -m "Deploy: S3 asset URLs and root redirect"
    git push origin main
    ```

2.  **Connect to Your EC2 Instance:**
    Use SSH to access your running EC2 instance.
    ```bash
    ssh -i "path/to/your-key-pair.pem" ec2-user@<Your-Elastic-IP-Address>
    ```

3.  **Pull Code and Update Environment Variables on EC2:**
    Navigate to your application's directory on the EC2 instance, pull the latest changes, and ensure your `.env` file on the server is updated with the correct AWS S3 credentials.
    ```bash
    cd /path/to/your/blog-app
    git pull
    # Ensure your .env file on EC2 matches the one in local installation with S3 details
    ```

4.  **Restart Application with PM2:**
    Restart the Node.js application using PM2 to load the new code and configurations.
    ```bash
    pm2 restart all
    ```
    You can check the status of your application with `pm2 status`.

5.  **Configure DNS in Route 53:**
    If you haven't already, configure your domain name in Route 53 to point to your EC2 instance's Elastic IP address.
    * Go to the AWS Console, search for **Route 53**, and navigate to **Hosted zones**.
    * Select your domain's hosted zone.
    * Create an **A record** (IPv4 address) for your domain (e.g., `@` or `www`).
    * Set the **Value** of the A record to your EC2 instance's **Elastic IP Address**.
    * Save the record set.
    * **DNS Propagation:** Be aware that DNS changes can take up to 48 hours to fully propagate across the internet, though often they resolve much faster.
