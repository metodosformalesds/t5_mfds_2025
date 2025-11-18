import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import "./AboutUS.css";

export default function AboutUs() {

  const navigate = useNavigate();

  return (
    <div className="about-container">
      <div className="about-left">
        <div className="about-image-frame">
          <img
            src="/about-plant.jpg"
            alt="Plants"
            className="about-image"
          />
        </div>
      </div>

      <div className="about-right">
        <h2 className="about-title">About Us — Sprout Market</h2>

        <p className="about-text">
          Sprout Market is a platform created to strengthen the plant-loving 
          community in Ciudad Juárez. We offer a simple, safe, and accessible 
          space where users can:
        </p>

        <ul className="about-list">
          <li>Buy plants and gardening products.</li>
          <li>Publish their own items for sale.</li>
          <li>Exchange plants through dedicated listings.</li>
          <li>Connect with people who share similar interests.</li>
        </ul>

        <p className="about-text">
          Our mission is to support a greener community, promote local commerce, 
          and provide a trustworthy environment where buyers, sellers, and plant 
          enthusiasts can interact transparently.
        </p>

        <p className="about-text">
          At Sprout Market, we continuously work to improve the user experience, 
          optimize the platform, and offer new tools that support the growth of 
          the gardening ecosystem in the region.
        </p>

        <button 
          className="about-btn"
          onClick={() => navigate("/shop")}
        >
          Explore
        </button>
      </div>
    </div>
  );
}
