import React from 'react';
import { Link } from 'react-router-dom';

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <div
      className={`modal${isOpen ? ' is-open' : ''}`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="aboutDialogTitle"
      aria-describedby="aboutDialogDescription"
    >
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__content modal__content--about">
        <button className="modal__close about-dialog__close" aria-label="Close about dialog" onClick={onClose}>
          ×
        </button>
        <div className="about-dialog">
          <h2 id="aboutDialogTitle" className="about-dialog__title">About</h2>
          <div className="about-dialog__break" aria-hidden="true" />
          <p id="aboutDialogDescription" className="about-dialog__text">
            <a className="about-dialog__inline-link" href="https://github.com/Wasp-Framework/Wasp-Atlas" target="_blank" rel="noreferrer noopener">Wasp Atlas</a>{' '}
            is a growing open library of modular building systems designed with the Grasshopper
            plug-in WASP, a combinatorial toolkit for discrete design. The plugin, developed by{' '}
            <a className="about-dialog__inline-link" href="https://www.linkedin.com/in/ar0551/" target="_blank" rel="noreferrer noopener">Andrea Rossi</a>{' '}
            is{' '}
            <a className="about-dialog__inline-link" href="https://github.com/ar0551/Wasp" target="_blank" rel="noreferrer noopener">open source</a>{' '}
            and available on{' '}
            <a className="about-dialog__inline-link" href="https://www.food4rhino.com/en/app/wasp" target="_blank" rel="noreferrer noopener">Food4Rhino</a>.
            The browser engine lives in{' '}
            <a className="about-dialog__inline-link" href="https://github.com/winroger/waspjs" target="_blank" rel="noreferrer noopener">webwaspjs</a>, and this website is maintained in{' '}
            <a className="about-dialog__inline-link" href="https://github.com/Wasp-Framework/Wasp-Atas-Explorer" target="_blank" rel="noreferrer noopener">Wasp-Atas-Explorer</a>{' '}
            by{' '}
            <a className="about-dialog__inline-link" href="https://www.linkedin.com/in/rogerwinkler/" target="_blank" rel="noreferrer noopener">Roger Winkler</a>{' '}
            in collaboration with the Wasp Framework. Both the dataset collection and the explorer are still evolving, so suggestions, feedback, and questions are welcome.
          </p>
          <div className="about-dialog__actions">
            <Link className="about-dialog__primary-cta" to="/datasets" onClick={onClose}>
              Explore
            </Link>
            <a className="landing__cta-secondary" href="mailto:hello@rogerwinkler.de">
              Get in touch ⤴
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
