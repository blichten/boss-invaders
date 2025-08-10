# Boss Invaders - Technical Documentation

## Architecture Overview

The Boss Invaders game is built using a modular architecture with clear separation of concerns:

- **Presentation Layer**: HTML5 Canvas for game rendering
- **Game Logic**: Vanilla JavaScript with object-oriented design
- **Styling**: CSS3 with responsive design patterns
- **Backend Integration**: WordPress REST API for data persistence
- **Lead Generation**: Custom plugin for player management

## Game Engine Architecture

### Core Classes

#### Game Class (`Game`)
- **Purpose**: Main game controller and loop manager
- **Responsibilities**:
  - Game state management (running, paused, game over)
  - Frame rate control and timing
  - Collision detection coordination
  - Score and wave progression

#### Entity System
- **Player**: User-controlled ship with movement and firing
- **Bosses**: Enemy characters with AI patterns
- **Projectiles**: Bullets and boss attacks
- **Particles**: Visual effects and explosions

### Game Loop

```javascript
// Main game loop structure
function gameLoop(timestamp) {
  if (!game.paused) {
    update(timestamp);
    render();
  }
  requestAnimationFrame(gameLoop);
}
```

### Collision Detection

Uses AABB (Axis-Aligned Bounding Box) collision detection:

```javascript
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}
```

## Responsive Design Implementation

### CSS Grid and Flexbox

The game uses modern CSS layout techniques:

```css
.wrap {
  display: grid;
  place-items: center;
  min-height: 100%;
  padding: 16px;
}
```

### Mobile-First Approach

1. **Base Styles**: Mobile-optimized layout
2. **Tablet Breakpoint**: `@media (min-width: 820px)`
3. **Desktop Breakpoint**: `@media (min-width: 1100px)`

### Touch Controls

Mobile devices get on-screen controls:

```css
.mobile-controls.active {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 12px;
  display: flex;
  justify-content: space-between;
}
```

## WordPress Integration

### Plugin Architecture

The `avlp-boss-invaders-leads` plugin follows WordPress best practices:

- **Activation Hooks**: Database table creation
- **REST API**: Custom endpoints for game data
- **Shortcodes**: Easy embedding in pages
- **Admin Interface**: Settings management

### Database Schema

#### Players Table
```sql
CREATE TABLE wp_boss_invaders_players (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  consent TINYINT(1) NOT NULL DEFAULT 0,
  token CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY token (token),
  KEY email (email)
);
```

#### Scores Table
```sql
CREATE TABLE wp_boss_invaders_scores (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  player_id BIGINT UNSIGNED NOT NULL,
  score INT UNSIGNED NOT NULL,
  wave INT UNSIGNED NOT NULL DEFAULT 1,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY player_id (player_id),
  KEY score (score)
);
```

### REST API Endpoints

#### Player Registration
```
POST /wp-json/boss-invaders/v1/register
{
  "name": "Player Name",
  "email": "player@example.com",
  "consent": 1
}
```

#### Score Submission
```
POST /wp-json/boss-invaders/v1/score
{
  "token": "player-token",
  "score": 1500,
  "wave": 3
}
```

#### High Scores
```
GET /wp-json/boss-invaders/v1/high-scores?limit=10
```

## Performance Optimizations

### Canvas Rendering

- **Object Pooling**: Reuse projectile and particle objects
- **Dirty Rectangle Rendering**: Only redraw changed areas
- **Efficient Collision**: Spatial partitioning for large numbers of objects

### Memory Management

- **Garbage Collection**: Minimize object creation in game loop
- **Resource Loading**: Preload images and audio
- **Cleanup**: Proper disposal of game objects

### Mobile Performance

- **Touch Event Optimization**: Debounced touch handling
- **Frame Rate Adaptation**: Adjust based on device capabilities
- **Battery Optimization**: Reduce unnecessary calculations

## Security Considerations

### Input Validation

- **Sanitization**: All user inputs are sanitized
- **Type Checking**: Strict parameter validation
- **SQL Injection Prevention**: Prepared statements

### CORS Configuration

```php
header('Access-Control-Allow-Origin: ' . $allowed_origin);
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
```

### Token Security

- **UUID Generation**: Secure random tokens
- **Expiration**: Configurable token lifetimes
- **Rate Limiting**: Prevent abuse of API endpoints

## Browser Compatibility

### Supported Browsers

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### Feature Detection

```javascript
// Check for required features
const hasCanvas = !!document.createElement('canvas').getContext;
const hasAudio = !!window.AudioContext || !!window.webkitAudioContext;
```

## Testing Strategy

### Manual Testing

1. **Cross-browser Testing**: Verify functionality in all supported browsers
2. **Device Testing**: Test on various screen sizes and devices
3. **Performance Testing**: Monitor frame rates and memory usage

### Automated Testing

- **Unit Tests**: Individual game object testing
- **Integration Tests**: WordPress plugin functionality
- **End-to-End Tests**: Complete game flow testing

## Deployment Process

### Staging Deployment

1. **Code Review**: Verify changes and test locally
2. **Staging Push**: Deploy to staging environment
3. **Testing**: Verify functionality and performance
4. **Production Push**: Deploy to production after approval

### Production Considerations

- **CDN Integration**: Serve static assets from CDN
- **Caching**: Implement appropriate caching strategies
- **Monitoring**: Track performance and error rates

## Future Enhancements

### Planned Features

- **Multiplayer Support**: Real-time competitive gameplay
- **Achievement System**: Unlockable content and badges
- **Social Integration**: Share scores on social media
- **Analytics Dashboard**: Player behavior insights

### Technical Improvements

- **WebGL Rendering**: Enhanced graphics capabilities
- **Service Worker**: Offline gameplay support
- **Progressive Web App**: Installable game experience
- **AI Difficulty**: Adaptive difficulty based on player skill

## Troubleshooting

### Common Issues

1. **Game Not Loading**: Check JavaScript console for errors
2. **Performance Issues**: Verify device capabilities and browser version
3. **WordPress Integration**: Check plugin activation and API endpoints
4. **Mobile Controls**: Ensure touch events are properly handled

### Debug Tools

- **Browser DevTools**: Console logging and performance profiling
- **WordPress Debug**: Enable WP_DEBUG for plugin issues
- **Network Monitoring**: Check API request/response cycles

---

This technical documentation provides a comprehensive overview of the Boss Invaders game implementation. For specific implementation details, refer to the source code and inline comments. 