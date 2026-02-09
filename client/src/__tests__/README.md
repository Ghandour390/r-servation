# Tests Client - Reservation/EventHub

## Vue d'ensemble

Suite de tests complète pour l'application client Next.js utilisant Jest et React Testing Library.

## Structure des tests

```
src/__tests__/
├── components/          # Tests des composants React
│   ├── LanguageSwitcher.test.tsx
│   ├── StatusBadge.test.tsx
│   ├── FilterBar.test.tsx
│   └── DashboardCard.test.tsx
├── hooks/              # Tests des hooks personnalisés
│   └── useTranslation.test.tsx
├── lib/                # Tests de la logique métier
│   ├── authSlice.test.ts
│   ├── languageSlice.test.ts
│   ├── cache.test.ts
│   └── api.test.ts
└── utils/              # Tests des utilitaires
    └── utils.test.ts
```

## Installation

```bash
npm install
```

## Exécution des tests

### Tous les tests
```bash
npm test
```

### Mode watch (développement)
```bash
npm run test:watch
```

### Avec couverture de code
```bash
npm run test:coverage
```

## Configuration

- **jest.config.js** : Configuration principale de Jest
- **jest.setup.js** : Configuration globale des tests (setup de @testing-library/jest-dom)

## Couverture des tests

Les tests couvrent :

### Composants
- ✅ LanguageSwitcher : Changement de langue et gestion du dropdown
- ✅ StatusBadge : Affichage des badges de statut avec styles appropriés
- ✅ FilterBar : Recherche et filtrage avec debounce
- ✅ DashboardCard : Cartes de statistiques du dashboard

### Hooks
- ✅ useTranslation : Gestion multilingue et changement de direction (RTL/LTR)

### Redux Slices
- ✅ authSlice : Authentification, login, logout
- ✅ languageSlice : Gestion de la langue et direction

### Utilitaires
- ✅ cn() : Fusion de classes CSS avec Tailwind
- ✅ Cache : Système de cache en mémoire avec expiration

### API
- ✅ Tests d'intégration pour les appels API (mocked)

## Bonnes pratiques

1. **Isolation** : Chaque test est indépendant
2. **Mocking** : Utilisation de mocks pour les dépendances externes
3. **Cleanup** : Nettoyage automatique après chaque test
4. **Assertions claires** : Messages d'erreur explicites

## Ajout de nouveaux tests

Pour ajouter un nouveau test :

1. Créez un fichier `*.test.tsx` ou `*.test.ts` dans le dossier approprié
2. Importez les utilitaires de test nécessaires
3. Suivez le pattern AAA (Arrange, Act, Assert)

Exemple :

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    render(<MyComponent />);
    
    // Act & Assert
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Dépendances de test

- **Jest** : Framework de test
- **@testing-library/react** : Utilitaires pour tester React
- **@testing-library/jest-dom** : Matchers personnalisés pour Jest
- **@testing-library/user-event** : Simulation d'interactions utilisateur

## CI/CD

Les tests sont exécutés automatiquement dans le pipeline CI/CD (voir `.github/workflows/ci.yml`).

## Ressources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
