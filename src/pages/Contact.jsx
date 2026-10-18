
import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">

      <div className="contact-hero">
        <p>GET IN TOUCH</p>

        <h1>Contact GYMFIT</h1>

        <span>
          Have a question about membership, training or our programs?
          Send us a message and our team can assist you.
        </span>
      </div>

      <div className="contact-layout">

        <div className="contact-info-card">

          <h2>Let's Talk</h2>

          <p>
            Our team is here to help with membership,
            training, programs and general gym enquiries.
          </p>

          <div className="contact-info-item">
            <span>GYMFIT</span>
            <strong>Fitness & Training Center</strong>
          </div>

          <div className="contact-info-item">
            <span>Support</span>
            <strong>Our team is available for enquiries</strong>
          </div>

          <div className="contact-info-item">
            <span>Working Hours</span>
            <strong>Monday - Sunday</strong>
          </div>

        </div>

        <div className="contact-form-card">

          <h2>Send Us a Message</h2>

          {submitted && (
            <div className="dashboard-message">
              Your message has been submitted successfully.
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="contact-form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Write your message..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">
              Send Message
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Contact;
