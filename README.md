# Lifesheet

[https://lifesheet.irazu.com.ar](https://lifesheet.irazu.com.ar) | Code: [github.com/jokogarcia/lifesheet-project](https://github.com/jokogarcia/lifesheet-project)

Lifesheet is an online platform designed to help job seekers create and format their CVs with ease. Its primary goal is to simplify the process of building a professional resume, ensuring that users can present their skills and experiences in the most effective way possible.

This service is ideal for anyone actively searching for employment, especially those who need to apply to multiple job postings. Lifesheet recognizes that each job application may require a tailored CV that highlights specific qualifications relevant to the position, or a Cover Letter. Instead of manually editing their resume for every application, users can input all their information into Lifesheet and later select which details are most pertinent for each job. They can either make these selections manually or leverage the built-in AI assistant to automatically identify the most relevant information based on the job description.

By streamlining the CV customization process, Lifesheet addresses the common challenge of applying to numerous jobs and increases the chances of landing an interview. Users save time and effort, while also ensuring that every application is targeted and professional.

## SaaS

Lifesheet is a Software as a Service (SaaS) platform, allowing users to access the service via a web browser without the need for local installation. This model provides several advantages, including easy updates, scalability, and accessibility from any device with an internet connection. The service is offered in two Tiers: Free and Premium

### Ads for the Free Tier

Users on the free tier, get access to the same features as premium users, but with ads displayed throughout the application. We integrate with Google AdSense for this purpose.

## Technical Breakdown

The application frontend is built using ReactJS with Typescript, utilizing Tailwind as a CSS framework. The backend is powered by Node.js and Express, with a MongoDB database for storing user data and CV templates. This tech stack allows for a responsive and dynamic user experience, while also ensuring scalability and maintainability.

The infrastructure is modest: every backend component operates in it's own Docker container. An Nginx instance operates as a Gateway and also takes care of TLS.

Even though, the frontend and backend are not served by the same "service", they do share the same domain, which makes CORS configuration straightforward, as well as allowing the application to seamlessly migrate to another server, or to run in a local dev environment.

### PDF Generation

For PDF generation, the document is generated on the frontend with a combination of JavaScript and CSS for advanced formatting. Then, the resulting HTML is sent to the backend where a PDF document is generated using Puppeteer, ensuring a high-quality output that preserves the layout and styling of the CV.

### Auth

Authentication is handled using a self-hosted **Keycloak** instance, providing a robust and flexible solution for user management and access control. This option was chosen due to its open-source nature, good reputation and community support

### AI-Features and Message based coordination for long-lived operations

AI features are implemented using **Gemini.AI**. The prompts are carefully crafted to ensure compatibility with the document structure expected by the platform's template, as well as to ensure the model only uses the true information provided by the user, without any fabrication.

API calls to Gemini, or any other LLM can often take several minutes to complete. Ordinary REST calls can timeout during this time, therefore we use a message-based approach to coordinate these long-lived operations.

On the backend, we use BullMQ to create jobs for each AI-dependant operation. This also allows us to easily implement retry logic with exponential backoff when a AI API calls fails with a transient error.

For the frontend, this means that when calling for an AI-operation to execute, the request is sent to the backend and a job is created in the BullMQ queue. The frontend can then poll the backend for the status of the job, allowing for a responsive user experience even for long-running operations. It also means that the user can safely close the browser or navigate away from the page without losing the progress of the operation.

### Stripe Integration

Payments for the Premium tiers are handled using a **Stripe** integration, allowing for secure and efficient processing of user subscriptions and transactions.

Payments are carried out using the Checkout Session workflow, which provides a seamless and secure payment experience for users. The backend then receives the payment confirmation in a webhook, marking the
