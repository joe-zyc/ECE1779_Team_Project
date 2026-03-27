# ECE1779_Team_Project

## Final Report

A README.md file serve as the final report, in the form of a Markdown document  with a maximum length of 5000 words 1 2. If you include images (e.g., screenshots), ensure they are visible when the instructor or TAs view your GitHub repository in a web browser.

The report should clearly and concisely cover the following aspects:

1. **Team Information**: List the names, student numbers, and preferred email addresses of all team members. Make sure these email addresses are active as they may be used for clarification requests.

2. **Motivation**: Explain why your team chose this project, the problem it addresses, and its significance.

3. **Objectives**: State the project objectives and what your team aimed to achieve through the implementation.

4. **Technical Stack**: Describe the technologies used, including the chosen orchestration approach (Swarm or Kubernetes) and other key tools.

5. **Features**: Outline the main features of your application and explain how they fulfill the course project requirements and achieve your objectives.

6. **User Guide**: Provide clear instructions for using each main feature, supported with screenshots where appropriate.

7. **Development Guide**: Include steps to set up the development environment, covering environment configuration, database, storage, and local testing.

8. **Deployment Information**: Provide the live URL of your application.

9. **AI Assistance & Verification (Summary)**: If AI tools contributed to your project, provide a concise, high-level summary demonstrating that your team:

    - Understands where and why AI was used
    - Can evaluate AI output critically
    - Verified correctness through technical means
      
    Specifically, briefly address:
    
    - Where AI meaningfully contributed (e.g.,architecture exploration, Docker/K8s configuration, debugging, documentation)
    - One representative mistake or limitation in AI output (details should be shown in ai-session.md)
    - How correctness was verified (e.g., testing, logs, monitoring metrics, manual inspection)
      
    Do not repeat full AI prompts or responses here. Instead, reference your ai-session.md file for concrete examples.

10. **Individual Contributions**: Describe the specific contributions of each team member, aligning with Git commit history.

11. **Lessons Learned and Concluding Remarks**: Share insights gained during development and any final reflections on the project experience.

**_____________________________________________________________________________________________________________________**

1. **Team Information**

  Noubar Nakhnikian - 1002995100 - noubar.nakhnikian@mail.utoronto.ca
  
  Yujie Qin - 1000703839 - email@email.com
  
  Yuechen Zhang - 1004810074 - email@email.com
  
  Tianchi Chen - 1003224799 - email@email.com

2. **Motivation**

  We chose this project because everyone has used websites like AutoTrader or FB Marketplace to browse for and buy used vehicles and we have all faced similar experiences with private dealers, excessive ads and spam, leading to an inefficient and unsatisfactory experience. OpenMotor was created to address these problems, and create an easy, safe and efficient used car marketplace, for both buyers and sellers. 
  
3. **Objectives**

4. **Technical Stack**
   
The application consists of 
- a frontend built with React
- a backend built with Node.js and Express
- a PostgreSQL database for stateful data storage
- an Email Notification Service to send matched listings to users.
This application is deployed on a Kubernetes cluster using Docker containers with DigitalOcean infrastructure.
