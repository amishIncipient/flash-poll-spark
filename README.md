# Flash Poll

A modern, responsive web application for creating and participating in real-time polls. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Real-time Polling**: Create polls and see live vote results
- **User Authentication**: Secure login, signup, and password reset
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes with persistent preferences
- **Poll Management**: Create, vote, and delete your own polls
- **Protected Routes**: Authentication-based navigation
- **Real-time Updates**: Live vote counting and poll statistics

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (Authentication, Database, Real-time)
- **State Management**: Zustand for authentication state
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📋 Recent Updates & Bug Fixes

### Authentication System Overhaul
- **Separated Auth Pages**: Moved from tabbed interface to individual pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`)
- **Enhanced Security**: Improved token validation for password reset flow
- **Better UX**: Clear navigation flows and error handling
- **State Management**: Fixed authentication persistence issues

### UI/UX Improvements
- **Theme System**: Implemented dark/light mode toggle using next-themes
- **Typography**: Integrated Inter font for better readability
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Library**: Leveraged shadcn/ui for consistent design system

### Dashboard Enhancement
- **Tabbed Interface**: Separated "Your Polls" and "All Polls" views
- **Statistics Cards**: Display poll counts and vote totals
- **Grid Layouts**: Responsive poll card arrangements
- **Loading States**: Proper loading indicators and empty states

### Poll Management
- **Delete Functionality**: Poll owners can delete their polls with confirmation
- **Real-time Voting**: Live vote updates without page refresh
- **Vote Tracking**: Users can see their votes and change them
- **Ownership Validation**: Proper access controls for poll actions

### Bug Fixes Implemented
- ✅ Fixed authentication state persistence across page reloads
- ✅ Resolved navigation redirect issues after login/logout
- ✅ Corrected theme toggle positioning consistency
- ✅ Fixed responsive layout problems on mobile devices
- ✅ Improved form validation and error handling
- ✅ Enhanced sign-out functionality with proper state cleanup
- ✅ Fixed protected route navigation flow

## 🔐 Security Enhancements

- **Protected Routes**: Authentication required for dashboard access
- **Database Security**: Row Level Security (RLS) policies implemented
- **Token Management**: Secure password reset token handling
- **State Cleanup**: Proper authentication state management on logout
- **Input Validation**: Comprehensive form validation with Zod schemas

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Configure Supabase credentials in your environment
   - Set up database tables and RLS policies

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📱 Usage

### Creating Polls
1. Sign up or log in to your account
2. Navigate to the Dashboard
3. Click "Create New Poll"
4. Add a title and multiple options
5. Submit to create your poll

### Voting
1. Browse available polls on the "All Polls" tab
2. Click on any poll option to vote
3. See real-time results and vote percentages
4. Change your vote anytime

### Managing Your Polls
1. View your created polls in the "Your Polls" tab
2. See total votes and engagement statistics
3. Delete polls you own with confirmation dialog

## 🎨 Design System

The application uses a comprehensive design system built with:
- **CSS Variables**: Semantic color tokens in `index.css`
- **Tailwind Config**: Custom theme configuration
- **Component Variants**: Reusable component styles
- **Dark/Light Themes**: Automatic theme switching
- **Responsive Breakpoints**: Mobile-first design approach

## 🔄 State Management

- **Authentication**: Zustand store for user session management
- **Forms**: React Hook Form for form state and validation
- **Theme**: next-themes for theme persistence
- **Real-time**: Supabase subscriptions for live updates

## 📊 Database Schema

### Tables
- `polls`: Store poll information (title, creator, timestamps)
- `poll_options`: Store individual poll choices
- `poll_votes`: Track user votes with relationships

### Relationships
- Polls → Poll Options (one-to-many)
- Users → Votes (one-to-many)
- Poll Options → Votes (one-to-many)

## 🚀 Deployment

The application can be deployed using:
- **Lovable Platform**: Direct deployment from the Lovable editor
- **Vercel/Netlify**: Static site deployment
- **Custom Domain**: Connect your own domain via project settings

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add appropriate loading states
5. Ensure responsive design compatibility
6. Write meaningful commit messages

## 📝 Architecture Decisions

### Component Structure
- **Page Components**: Handle routing and layout
- **Feature Components**: Encapsulate specific functionality
- **UI Components**: Reusable design system elements
- **Hooks**: Custom logic for authentication and data fetching

### Performance Optimizations
- **Code Splitting**: Lazy loading for routes
- **Memoization**: Optimized re-renders with React.memo
- **Real-time Subscriptions**: Efficient data synchronization
- **Image Optimization**: Proper asset handling

## 🐛 Known Issues & Future Improvements

### Planned Enhancements
- [ ] Poll expiration dates
- [ ] Advanced poll analytics
- [ ] Social sharing features
- [ ] Email notifications
- [ ] Poll categories and tags
- [ ] Export poll results

### Performance Monitoring
- Real-time vote updates
- Authentication state persistence
- Theme switching performance
- Mobile responsiveness

## 📄 License

This project is part of the Lovable platform ecosystem.

## 🔗 Links

- **Live Application**: [View Deployment](https://lovable.dev/projects/a74d88c2-a3f4-478c-abb9-06daf884824f)
- **Lovable Editor**: [Edit Project](https://lovable.dev/projects/a74d88c2-a3f4-478c-abb9-06daf884824f)
- **Documentation**: [Lovable Docs](https://docs.lovable.dev)

---

Built with ❤️ using [Lovable](https://lovable.dev)