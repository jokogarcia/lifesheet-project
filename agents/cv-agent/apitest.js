
async function callApi(cv,job_description){
    const response = await fetch('http://localhost:8000/tailor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cv, job_description })
    });
    if(response.status > 299) {
        const errorData = await response.json();
        throw new Error(`API call failed: Status ${response.status}, Message: ${errorData.detail}`);
    }
    const data = await response.json();
    return data;
}

const cv =`{
  "name": "Joaquín García",
  "title": "Senior Software Developer",
  "workExperienceTitle": "WORK EXPERIENCE",
  "educationTitle": "EDUCATION",
  "summaryTitle": "PROFESSIONAL SUMMARY",
  "skillsTitle": "TECHNICAL SKILLS",
  "languageSkillsTitle": "LANGUAGE SKILLS",
  "summary": "Experienced software developer with over 8 years of experience in full-stack development and Dev-Ops. Specialized in Node.JS with Typescript and .Net with C#. Passionate about creating efficient, scalable, and user-friendly applications.",
  "profilePictureUrl": "https://github.com/jokogarcia/jokogarcia/blob/main/assets/Perfil.png?raw=true",
  "contactInfo": {
    "email": "joaquin.garciaml@hotmail.com",
    "phone": "+491573906833",
    "address": "Merkststraße 12C. 82405 Wessobrunn, Germany",
    "linkedin": "www.linkedin.com/in/joaquin-garcia-ml",
    "github": "www.github.com/jokogarcia",
    "dateOfBirth": "1983-07-29",
    "website": ""
  },
  "education": [
    {
      "institution": "Universidad Tecnológica Nacional (UTN)",
      "degree": "Electronic Engineer (<i>Ingeniero en Electrónica</i>)",
      "startDate": "2002-03",
      "endDate": "2015-12",
      "description": "ANABIM Equivalence: 'Studienrichtung: Ingenieurwessen (Elektronik). Abschlussklasse: A5'",
      "location": "La Rioja, Argentina"
    },
    {
      "institution": "Colegio Provincial Número 1 'Joaquín V. González'",
      "degree": "High School Diploma with a Specialization in Physics and Mathematics",
      "startDate": "2000-03",
      "endDate": "2001-12",
      "description": "Graduated with honors. Minor in Physics and Mathematics.",
      "location": "La Rioja, Argentina"
    }
  ],
  "workExperience": [
    {
      "company": "Edugo.AI",
      "position": "Senior Backend Engineer",
      "startDate": "2024-01",
      "location": "Wessobrunn, Germany (remote)",
      "endDate": "2025-07",
      "achievements": [
        "Improved stability by migrating from a monolith to a microservices-based architecture orchestrated with Kubernetes.",
        "Enhanced data security by implementing recommendations from an independent security audit.",
        "Increased developer productivity by implementing CI/CD pipelines.",
        "Improved availability and stability of in-platform video calls.",
        "Developed an in-house, multi-user feature for live-annotating PDF documents during video calls.",
        "Increased code quality and reliability by advocating for and implementing unit testing with Jest and Playwright.",
        "Led efforts to establish and document best practices and code style guides for internal use.",
        "Conducted stress and load tests on the backend to ensure readiness for increased user demand, identifying and addressing bottlenecks.",
        "Served as Point of Contact to Key Customers."
      ],
      "description": "Sole Backend Specialist in a team of 5, focusing on the development of AI-driven educational platforms."
    },
    {
      "company": "Anuvu",
      "position": "NOC Technician",
      "startDate": "2021-10*",
      "endDate": "2023-12",
      "location":"Raisting, Germany",
      "achievements": [
        "Provided first and second level support for international maritime customers, ensuring high-quality service and rapid issue resolution.",
        "Maintained a high level of customer satisfaction by effectively communicating with customers and third-party vendors.",
        "Provided support for Field Engineers, ensuring smooth operations and quick resolution of technical issues.",
        "Ensured high level of documentation and knowledge sharing, on a diverse technical stack"
      ],
      "description": "<i>*Note: <b>Also from 2016 to 2018 in Argentina.</b></i> Technical support of maritime satellite communications systems. Real time troubleshooting of complex technical solutions in a fast paced environment."
    },
    {
      "company": "Accenture",
      "position": ".NET Developer",
      "startDate": "2021-04",
      "endDate": "2021-09",
      "location":"La Rioja, Argentina (remote)",
      "achievements": [
        "Developed the feature 'Adaptive View' reducing development time for new features by eliminating the need to create new views for each feature."
      ],
      "description": "Assigned to customer Banco Galicia (https://www.bancogalicia.com.ar/), working on the e-bank portal for businesses."
    },
    {
      "company": "TPS S.A.",
      "position": "Semi-Senior Software Developer",
      "startDate": "2019-10",
      "endDate": "2021-04",
      "location":"La Rioja, Argentina (remote)",
      "description": "Started as a Junior Mobile Developer and transitioned to a more senior, Full Stack position and customer Point of Contact.",
      "achievements": [
        "Created Application Cross-Platform application for loyalty points tracking \"Interpuntos\" for customer Intermex (intermexonline.com).",
        "Succesfully integrated with the client's backend based on SQL Server Stored Procedures and with their Auth Service based on IdentityServer 4.",
        "Migrated the Frontend of the internal tool 'CheckDirect' (for the same custommer) from a Delphi-based Windows Application to an Angular-based Web Application."
      ]
    },
    {
      "company": "Quanta Iluminación",
      "position": "Embedded Systems Designer",
      "startDate": "2013-01",
      "endDate": "2016-04",
      "location":"La Rioja, Argentina",
      "description": "Power electronics design and Embedded Software development for LED lighting systems.",
      "achievements": [
        "Designed and implemented a variety of digital and analog RGB light controllers for LED lights.",
        "Created a robust communication protocol based on DMX512 for synchronizing and addressing individual Lamps, supporting Wireless, Wired and Hybrid networks.",
        "Developed GUIs for programming and live control of RGB lights."
      ]
    }
  ],
  "skills": [
    ".Net",
    ".Net MAUI",
    "Agile/Scrum",
    "ArgoCD",
    "C",
    "C#",
    "CI/CD",
    "Docker",
    "Git",
    "Github Actions",
    "Jest",
    "Google Cloud Platform",
    "JavaScript",
    "Playwright",
    "Kubernetes",
    "MongoDB",
    "Node.js",
    "Performance Optimization",
    "PostgreSQL",
    "Python",
    "React",
    "RESTful APIs",
    "SQL Server",
    "SQLite",
    "System Architecture",
    "Tkinter",
    "TypeScript",
    "Unit Testing",
    "Xamarin",
    "Zoom SDK"
  ],
  "languageSkills": [
    {
      "language": "Spanish",
      "level": "Native"
    },
    {
      "language": "English",
      "level": "C2"
    },
    {
      "language": "German",
      "level": "Coursing A2"
    }
  ]
}`;
const job_description=`About the job


What you will do

Join us in helping companies of different sizes and industries take their own climate action today. We are dedicated to working as a team towards our common goal: making net zero a reality. 
 
Become part of our Digital Products team in Munich, where we work in cross-functional and autonomous teams that co-create products and take ownership from idea to impact. 
 
We are not looking for one of those “rockstars,” “ninjas,” or “10x developers”. We do, however, expect you to have solid fundamentals when it comes to software development, troubleshooting, system design, and most importantly, teamwork. 

You are responsible for designing, developing, and implementing high-quality software solutions that empower our users and advance our company’s mission
You work closely with international teams of engineers, product owners and designers, to translate requirements into efficient and robust code
You build scalable solutions that keep up with increasing user demand and internationalization across the globe 
You unify the usability, architecture and tech stack of the products we already have
You work across the full stack and run what we build in production 



Who you are

You have at least 2-4 years of experience working in software development
You should know your way around TypeScript, React, and AWS
You have a lot of ideas and are not afraid to take a stand for them
You are an avid learner and continuously improve yourself and your work - you actively help, give feedback and act upon feedback you receive
You communicate professionally in English



Benefits

Join our dynamic and international team where you can be who you are. We work together in an open and uncomplicated way and also enjoy socialising outside of work. In addition to a job with meaning, we also offer you the following benefits:

Our bright, modern offices are centrally located and easily accessible by all modes of transport.
We love environmentally friendly alternatives for travelling to the office! To support this, you can opt for a JobRad.
Sport clears your head and makes us feel good! We support you with a subsidy for various sports programmes.
We offer 30 days holiday, because we believe that time off is important.
We enable you to work flexibly and in a hybrid way (with 60% on-site presence) so that you can achieve an even better work-life balance.
Regular check-ins and development meetings are part of our feedback culture.
You have the opportunity to take out a company pension scheme with an employer subsidy.
It goes without saying that we provide free tea, coffee and fruit to ensure your well-being at work.



How to apply

Simply click the application button to apply for this position. Make sure that you include the following documents in English:

Your latest CV
A cover letter
Your gitHub profile (if applicable)
Have any questions? Feel free to contact Tobias Pieri (jobs@climatepartner.com) from the Engineering team.

Creating an inclusive environment is important to us. We provide equal opportunities to all qualified applicants without regard to any aspect that makes them unique. If you need any reasonable adjustments to make the application process accessible for you, we’ll do our best to accommodate you.

Find out more about working at ClimatePartner and see all our current job openings at Career | ClimatePartner
We look forward to your application!



About us

ClimatePartner supports companies in decarbonisation. Our hybrid model combines software that simplifies and scales processes with expert advice at every step on the path to net zero – from calculating and reducing emissions to supporting climate projects and communicating transparently.

For over 20 years, more than 6,000 companies have worked with ClimatePartner to achieve decarbonisation. For the climate. And for business.


`
console.log("API call initiated");
callApi(cv,job_description).then((response) => {
    console.log("API call successful, response received:", response);
}).catch((error) => {
    console.error("Error occurred during API call:", error);
});