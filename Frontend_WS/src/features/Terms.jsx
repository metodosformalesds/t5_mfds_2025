/**

 * Autor: Erika Clara Frayre

 * Componente: Terms and conditions

 * Descripción: Muestra los terminos y condiciones del negocio, con el objetivo de darle a conecer al usuario las normas del negocio

 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import "./Terms.css";

const Terms = () => {
  return (
    <div className="terms-page-container">
      <div className="terms-card">
        <h2 className="terms-title">Terms and Conditions — Sprout Market</h2>
        <p className="terms-date">Last updated: 17-11-2025</p>

        <p>
          Welcome to <strong>Sprout Market</strong>, a digital platform dedicated 
          to buying, selling, and exchanging plants and gardening products in 
          Ciudad Juárez, Chihuahua, Mexico. By accessing and using our website, 
          you agree to these Terms and Conditions. If you do not agree, we 
          recommend discontinuing the use of the site.
        </p>

        <h3>1. Use of the Platform</h3>
        <p>Sprout Market allows users to:</p>
        <ul>
          <li>Publish items for sale or exchange.</li>
          <li>Purchase products posted by other users.</li>
          <li>Receive exchange offers.</li>
          <li>View contact information upon confirming a transaction.</li>
        </ul>

        <p>Users agree to:</p>
        <ul>
          <li>Provide truthful and updated information.</li>
          <li>Use the site only for lawful purposes.</li>
          <li>Refrain from interfering with the functionality of the platform.</li>
        </ul>

        <p>
          Any attempt at manipulation, fraud, or misuse will result in the 
          immediate suspension of the account.
        </p>

        <h3>2. User Registration and Responsibility</h3>
        <p>
          To publish or complete transactions, it is necessary to create an account 
          on Sprout Market. By registering, the user declares that:
        </p>
        <ul>
          <li>They are at least 18 years old.</li>
          <li>The information provided is authentic.</li>
          <li>They will maintain confidentiality of their credentials.</li>
        </ul>

        <p>
          Sprout Market is not responsible for unauthorized access resulting from 
          improper handling of personal information by the user.
        </p>

        <h3>3. Listings on the Site</h3>

        <h4>Items for Sale</h4>
        <p>Users posting items for sale must include:</p>
        <ul>
          <li>Price</li>
          <li>Available quantity</li>
          <li>Clear description</li>
          <li>Real images of the product</li>
        </ul>
        <p>It is prohibited to offer false, illegal, or nonexistent products.</p>

        <h4>Exchange Listings</h4>
        <ul>
          <li>Posting an item for exchange has a one-time cost of $90 MXN.</li>
          <li>Users may edit or remove their listing at no additional cost.</li>
          <li>They may receive up to four active exchange offers.</li>
        </ul>

        <p>
          When an offer is accepted, both parties will receive contact information 
          to coordinate the exchange.
        </p>

        <p>
          Sprout Market does not handle deliveries and is not responsible for 
          unfulfilled agreements between users.
        </p>

        <h3>4. Payments and Fees</h3>
        <p>
          All payments are processed through <strong>Stripe</strong>, a 
          PCI-DSS-certified platform.
        </p>
        <ul>
          <li>Sprout Market charges a 10% commission on sold products.</li>
          <li>Deliveries or exchanges are coordinated directly between users.</li>
          <li>
            Sprout Market does not intervene in logistics, transportation, or 
            product quality once the transaction is completed.
          </li>
        </ul>

        <h3>5. Intellectual Property</h3>
        <p>
          All visible elements on Sprout Market—such as logos, content, 
          interfaces, text, and images (except for those uploaded by users)—are 
          protected by intellectual property laws. Reproduction without 
          authorization is prohibited.
        </p>

        <h3>6. Limitation of Liability</h3>
        <p>Sprout Market is not responsible for:</p>
        <ul>
          <li>User-to-user breaches of agreement.</li>
          <li>Delivery or exchange errors.</li>
          <li>Damages or product loss.</li>
          <li>Misleading listings posted by users.</li>
        </ul>
        <p>The platform acts solely as a digital intermediary.</p>

        <h3>7. Modifications</h3>
        <p>
          Sprout Market reserves the right to update these Terms and Conditions 
          at any time. The current version will always be the one published on 
          this website.
        </p>
      </div>
    </div>
  );
};

export default Terms;
