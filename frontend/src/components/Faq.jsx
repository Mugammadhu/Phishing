/* eslint-disable react/prop-types */

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/faq.css"; // Custom styles for additional effects

const Faq = () => {
  const faqs = [
    { question: "What is phishing?", answer: "Phishing is a cyber attack where scammers trick users into revealing sensitive information." },
    { question: "How can I protect myself?", answer: "Use tools like phishing detectors and always verify links before clicking." },
    { question: "Are these tools free to use?", answer: "Yes, our tools provide free basic protection with optional premium features." }
  ];

  return (
    <section className="faq-container container py-5">
      <h2 className="text-center text-white mb-4">Frequently Asked Questions</h2>
      <div className="accordion" id="faqAccordion">
        {faqs.map((faq, index) => (
          <FAQItem key={index} index={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
};

const FAQItem = ({ index, question, answer }) => {
  return (
    <div className="accordion-item">
      <h2 className="accordion-header">
        <button 
          className="accordion-button collapsed" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target={`#collapse${index}`} 
          aria-expanded="false" 
          aria-controls={`collapse${index}`}
        >
          {question}
        </button>
      </h2>
      <div 
        id={`collapse${index}`} 
        className="accordion-collapse collapse" 
        data-bs-parent="#faqAccordion"
      >
        <div className="accordion-body">{answer}</div>
      </div>
    </div>
  );
};

export default Faq;
