import React from "react";
import { Card, Button } from "react-bootstrap";
import "./Menu.scss";
const Contact = () => {
  return (
    <div
      style={{
        margin: "5% ",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        style={{
          width: "20rem",
        }}
      >
        <Card.Img
          variant="top"
          src="https://media-exp1.licdn.com/dms/image/C5103AQEGH3g_HDVspw/profile-displayphoto-shrink_400_400/0/1579249530443?e=1639008000&v=beta&t=O4JDU3U7mXg0QRdnwnR7hD5wJSgS9fh3u1B3ZhERYaw"
        />
        <Card.Body>
          <Card.Title>Ankit Tyagi</Card.Title>
          <Card.Text>
            Hii,I love to learn new things.Contact me on the below social media
            handles.
          </Card.Text>

          <a
            style={{ textDecoration: "none" }}
            href="https://www.linkedin.com/in/ankittyagi-webdeveloper/"
            target="_blank"
          >
            <Button variant="primary" className="navbar">
              linkedin
            </Button>
          </a>
        </Card.Body>
      </Card>
    </div>
  );
};
export default Contact;
