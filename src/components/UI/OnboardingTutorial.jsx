import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

export default function OnboardingTutorial({ forceRun = false, onComplete = () => {} }) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if tutorial has already been seen
    const hasSeenTutorial = localStorage.getItem('obsmed_tutorial_seen');
    if (!hasSeenTutorial || forceRun) {
      // Small delay to let the app render completely
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forceRun]);

  const steps = [
    {
      target: '.app-sidebar',
      content: 'Bienvenue dans ObsMed 2026 ! Voici la barre de navigation. Vous y trouverez toutes les sections de votre observation médicale.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: 'nav button:nth-child(3)',
      content: 'L\'Histoire de la Maladie est le cœur de votre observation. Vous pourrez y ajouter des symptômes et générer un récit automatique.',
      placement: 'right',
    },
    {
      target: '.section-indicators',
      content: 'Vous pouvez aussi utiliser ces indicateurs pour naviguer rapidement et voir d\'un coup d\'œil où vous en êtes.',
      placement: 'bottom',
    },
    {
      target: '.progress-bar-container',
      content: 'Cette barre de progression vous indique à quel point votre observation est complète. Visez les 100% !',
      placement: 'bottom',
    },
    {
      target: '.theme-toggle',
      content: 'Vous préférez travailler de nuit ? Activez le mode sombre ici.',
      placement: 'left',
    },
    {
      target: '.nav-footer',
      content: 'Utilisez ces boutons (ou Alt + Flèches sur votre clavier) pour passer d\'une section à l\'autre sans utiliser la souris.',
      placement: 'top',
    },
    {
      target: 'body',
      content: 'Vous êtes prêt(e) à rédiger des observations de qualité professionnelle !',
      placement: 'center',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('obsmed_tutorial_seen', 'true');
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: 'var(--beige-dark)',
          backgroundColor: 'var(--surface)',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: 'var(--primary)',
          textColor: 'var(--text-main)',
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        buttonNext: {
          backgroundColor: 'var(--primary)',
          borderRadius: 'var(--radius-sm)'
        },
        buttonBack: {
          marginRight: 10,
          color: 'var(--text-muted)'
        }
      }}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer le tutoriel'
      }}
    />
  );
}
