# Boss Invaders

A modern, responsive Space Invaders-style game featuring "bad bosses" instead of aliens. Built with vanilla JavaScript, HTML5 Canvas, and CSS3, this game serves as an engaging lead generation tool for VirtualLeadershipPrograms.com.

## 🎮 Game Features

- **Classic Space Invaders Gameplay**: Defend against waves of boss characters
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Touch Controls**: Mobile-friendly on-screen controls for touch devices
- **Lead Generation**: Integrated player registration and score tracking
- **High Score System**: Persistent leaderboard with player rankings
- **Modern UI**: Beautiful gradient backgrounds and smooth animations

## 🎯 Boss Characters

The game features various "bad boss" characters from popular culture:
- Bill Lumbergh (Office Space)
- Megatron (Transformers)
- Michael Scott (The Office)
- Miranda Priestly (The Devil Wears Prada)
- Mr. Burns (The Simpsons)

## 🛠️ Technical Stack

- **Frontend**: Vanilla JavaScript, HTML5 Canvas, CSS3
- **Backend**: WordPress with custom plugin
- **Database**: MySQL with custom tables for players and scores
- **API**: RESTful endpoints for player registration and score submission
- **Responsive**: Mobile-first design with touch controls

## 📁 Project Structure

```
boss-invaders/
├── assets/
│   ├── css/
│   │   └── boss-invaders.css      # Game styles and responsive design
│   ├── img/
│   │   ├── boss-*.png             # Boss character sprites
│   │   ├── vlp-logo.png          # Company logo
│   │   └── vlp-ship.png          # Player ship sprite
│   ├── js/
│   │   └── boss-invaders.js      # Main game logic
│   └── sfx/
│       ├── boss-laugh.wav        # Boss sound effects
│       └── evil-laugh.wav
├── boss-invaders-prototype.html  # Main game HTML file
├── index.php                      # WordPress integration
└── README.md                      # This file
```

## 🔌 WordPress Plugin

The game integrates with WordPress through the `avlp-boss-invaders-leads` plugin:

- **Player Management**: Registration, authentication, and consent tracking
- **Score Tracking**: Persistent high score storage and leaderboards
- **REST API**: Endpoints for game integration
- **Shortcodes**: Easy embedding in WordPress pages
- **Admin Interface**: Settings and configuration management

### Database Tables

- `wp_boss_invaders_players`: Player information and authentication tokens
- `wp_boss_invaders_scores`: Game scores and wave progression

## 🚀 Getting Started

### Prerequisites

- WordPress installation
- PHP 7.4+
- MySQL 5.7+
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/boss-invaders.git
   ```

2. **Install the WordPress plugin**:
   - Copy the `avlp-boss-invaders-leads` plugin to your `wp-content/plugins/` directory
   - Activate the plugin in WordPress admin

3. **Configure the plugin**:
   - Go to Settings > Boss Invaders
   - Set the allowed origin for your game domain

4. **Embed the game**:
   - Use the `[boss_invaders_signup]` shortcode for player registration
   - Use the `[boss_invaders_highscores]` shortcode for leaderboards

### Development

1. **Local Development**:
   ```bash
   cd boss-invaders
   # Open boss-invaders-prototype.html in your browser
   ```

2. **WordPress Integration**:
   - Ensure the plugin is activated
   - Test the REST API endpoints
   - Verify CORS settings for your domain

## 🎮 Game Controls

### Desktop
- **Arrow Keys**: Move left/right
- **Spacebar**: Fire
- **P**: Pause/Resume

### Mobile/Touch
- **On-screen buttons**: Left, Right, and Fire controls
- **Touch gestures**: Swipe to move, tap to fire

## 🔧 Configuration

### Plugin Settings

- **Allowed Origin**: Set the domain that can post scores to the API
- **CORS Headers**: Automatically configured for cross-origin requests
- **Database Tables**: Automatically created on plugin activation

### Game Customization

- **Boss Characters**: Replace sprite images in `assets/img/`
- **Sound Effects**: Update audio files in `assets/sfx/`
- **Styling**: Modify CSS variables in `assets/css/boss-invaders.css`
- **Game Logic**: Adjust difficulty and mechanics in `assets/js/boss-invaders.js`

## 📱 Responsive Design

The game automatically adapts to different screen sizes:

- **Desktop (>1100px)**: Full layout with side panels
- **Tablet (820px-1100px)**: Compact layout without side panels
- **Mobile (<820px)**: Stacked layout with on-screen controls
- **Touch Devices**: Optimized touch controls and gestures

## 🔒 Security Features

- **Token-based Authentication**: Secure player identification
- **Input Validation**: Sanitized user inputs and API parameters
- **CORS Protection**: Configurable origin restrictions
- **SQL Injection Prevention**: Prepared statements and WordPress security

## 🚀 Deployment

### Staging Server

The project includes deployment scripts for staging environments:

```bash
# Deploy to staging
./deploy-staging.sh
```

### Production

1. **Upload files** to your web server
2. **Activate the WordPress plugin**
3. **Configure allowed origins** in plugin settings
4. **Test the game** and API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software developed for VirtualLeadershipPrograms.com.

## 🆘 Support

For technical support or questions:
- Check the WordPress plugin documentation
- Review the game console for JavaScript errors
- Verify plugin settings and database connectivity

## 🔄 Version History

- **v0.1.1**: Initial release with WordPress integration
- **v0.1.0**: Core game functionality and responsive design

---

**Built with ❤️ for VirtualLeadershipPrograms.com** 