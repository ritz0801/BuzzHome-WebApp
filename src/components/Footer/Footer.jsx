import React from "react";
import "./Footer.scss";
import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className="footer">
			Made By <Link to="/https://www.facebook.com/r1tz0801">Dung Vo</Link> With
			The Big Vision
		</footer>
	);
};

export default Footer;
