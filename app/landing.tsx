import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Phone,
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  Smartphone,
  Monitor,
  Camera,
} from 'lucide-react-native';


const isWeb = Platform.OS === 'web';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  reverse?: boolean;
}

interface TestimonialProps {
  quote: string;
  author: string;
  relation: string;
}

interface PricingPlanProps {
  title: string;
  price: string;
  features: { name: string; included: boolean }[];
  isPrimary?: boolean;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, reverse = false }) => {
  return (
    <View style={[styles.featureCard, reverse && styles.featureCardReverse]}>
      <View style={styles.featureIcon}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
};

const TestimonialCard: React.FC<TestimonialProps> = ({ quote, author, relation }) => {
  return (
    <View style={styles.testimonialCard}>
      <View style={styles.testimonialStars}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
        ))}
      </View>
      <Text style={styles.testimonialQuote}>&ldquo;{quote}&rdquo;</Text>
      <Text style={styles.testimonialAuthor}>{author}</Text>
      <Text style={styles.testimonialRelation}>{relation}</Text>
    </View>
  );
};

const PricingPlan: React.FC<PricingPlanProps> = ({ title, price, features, isPrimary = false, onPress }) => {
  return (
    <View style={[styles.pricingCard, isPrimary && styles.pricingCardPrimary]}>
      {isPrimary && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}
      <Text style={styles.pricingTitle}>{title}</Text>
      <Text style={styles.pricingPrice}>{price}</Text>
      
      <View style={styles.featuresList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <CheckCircle 
              size={20} 
              color={feature.included ? '#10B981' : '#D1D5DB'} 
              fill={feature.included ? '#10B981' : 'transparent'}
            />
            <Text style={[styles.featureText, !feature.included && styles.featureTextDisabled]}>
              {feature.name}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.pricingButton, isPrimary && styles.pricingButtonPrimary]} 
        onPress={onPress}
      >
        <Text style={[styles.pricingButtonText, isPrimary && styles.pricingButtonTextPrimary]}>
          {isPrimary ? 'Get Premium' : 'Start with Free'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function LandingPage() {
  const handleGetStarted = () => {
    console.log('Get Started pressed');
  };

  const handleSeeHowItWorks = () => {
    console.log('See how it works pressed');
  };

  const handleFreePlan = () => {
    console.log('Free plan selected');
  };

  const handlePremiumPlan = () => {
    console.log('Premium plan selected');
  };

  const features = [
    { name: 'Simple Launcher', included: true },
    { name: 'One-Tap Calling', included: true },
    { name: 'Remote Contact Management', included: false },
    { name: 'Battery & Activity Alerts', included: false },
    { name: '&ldquo;I&rsquo;m OK&rdquo; Check-Ins', included: false },
    { name: 'Remote Reminders', included: false },
    { name: 'Family Photo Sharing', included: false },
    { name: 'Priority Support', included: false },
  ];

  const premiumFeatures = features.map(f => ({ ...f, included: true }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroHeadline}>
              Your Parent&rsquo;s Simple Phone.{"\n"}
              Your Powerful Control Panel.
            </Text>
            <Text style={styles.heroSubheadline}>
              CareConnect replaces confusing smartphone screens with a simple, easy-to-use interface. 
              Remotely manage contacts, set reminders, and get peace of mind—all from your computer.
            </Text>
            
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
                <Text style={styles.primaryButtonText}>Get Started for Free</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSeeHowItWorks}>
                <Text style={styles.secondaryButtonText}>See how it works</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.heroVisual}>
            <View style={styles.phonePreview}>
              <Smartphone size={120} color="#FFFFFF" />
            </View>
            <View style={styles.dashboardPreview}>
              <Monitor size={100} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>

        {/* Problem Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tired of being tech support for your parent&rsquo;s phone?</Text>
          
          <View style={styles.problemGrid}>
            <View style={styles.problemCard}>
              <Text style={styles.problemEmoji}>😵‍💫</Text>
              <Text style={styles.problemTitle}>Confusing Screens</Text>
              <Text style={styles.problemDescription}>Tiny icons, complicated menus, and accidental taps.</Text>
            </View>
            
            <View style={styles.problemCard}>
              <Text style={styles.problemEmoji}>📞</Text>
              <Text style={styles.problemTitle}>Endless Support Calls</Text>
              <Text style={styles.problemDescription}>Walking them through simple changes over the phone.</Text>
            </View>
            
            <View style={styles.problemCard}>
              <Text style={styles.problemEmoji}>😰</Text>
              <Text style={styles.problemTitle}>Constant Worry</Text>
              <Text style={styles.problemDescription}>Wondering if they&rsquo;re okay and if they can reach you in an emergency.</Text>
            </View>
          </View>
        </View>

        {/* Solution Section */}
        <View style={[styles.section, styles.solutionSection]}>
          <Text style={styles.sectionTitle}>How CareConnect Brings You Both Peace of Mind</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>You Install & Customize Remotely</Text>
              <Text style={styles.stepDescription}>
                Create an account and use our simple portal to add your parent&rsquo;s favorite contacts with photos.
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>They Use a Simple Phone</Text>
              <Text style={styles.stepDescription}>
                We send your parent a link. They tap it, and their phone is instantly transformed with big, easy-to-tap buttons.
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>You Stay Connected Effortlessly</Text>
              <Text style={styles.stepDescription}>
                Update their phone anytime from your dashboard. No more stressful support calls.
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Everything they need. Everything you control.</Text>
          
          <View style={styles.featuresContainer}>
            <FeatureCard
              icon={<Phone size={40} color="#667eea" />}
              title="One-Tap Calling"
              description="They call anyone with a single tap on a big, photo-based button. No more searching for contacts."
            />
            
            <FeatureCard
              icon={<Monitor size={40} color="#667eea" />}
              title="Remote Management Portal"
              description="You add or remove contacts, set medication reminders, and check their phone&rsquo;s battery life—all from your computer, miles away."
              reverse
            />
            
            <FeatureCard
              icon={<Heart size={40} color="#667eea" />}
              title="&lsquo;I&rsquo;m OK&rsquo; Check-In & Alerts"
              description="A simple button lets them send an &lsquo;I&rsquo;m OK!&rsquo; message. Get alerts if their battery is low or they haven&rsquo;t been active."
            />
            
            <FeatureCard
              icon={<Camera size={40} color="#667eea" />}
              title="Photo Sharing"
              description="Remotely add photos to a shared album that automatically appears on their home screen. A window to your family."
              reverse
            />
          </View>
        </View>

        {/* Testimonials Section */}
        <View style={[styles.section, styles.testimonialsSection]}>
          <Text style={styles.sectionTitle}>Helping families stay connected</Text>
          
          <View style={styles.testimonialsContainer}>
            <TestimonialCard
              quote="Setting up my mom&rsquo;s phone used to be a nightmare. With CareConnect, I did it on my lunch break. It&rsquo;s been a game-changer."
              author="Sarah D."
              relation="Daughter"
            />
            
            <TestimonialCard
              quote="I love that I can see new pictures of my grandkids without having to figure anything out. I just tap the screen."
              author="Robert"
              relation="Grandfather"
            />
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Simple pricing for peace of mind</Text>
          
          <View style={styles.pricingContainer}>
            <PricingPlan
              title="Free Plan"
              price="Free Forever"
              features={features}
              onPress={handleFreePlan}
            />
            
            <PricingPlan
              title="CareConnect Premium"
              price="$6.99/month or $59/year (Save 30%)"
              features={premiumFeatures}
              isPrimary
              onPress={handlePremiumPlan}
            />
          </View>
        </View>

        {/* Final CTA Section */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.finalCtaSection}
        >
          <Text style={styles.finalCtaTitle}>Give your parent the gift of simple connection.</Text>
          <Text style={styles.finalCtaSubtext}>
            Join thousands of families who have found peace of mind. Set up your parent&rsquo;s phone in minutes.
          </Text>
          
          <TouchableOpacity style={styles.finalCtaButton} onPress={handleGetStarted}>
            <Text style={styles.finalCtaButtonText}>Create Your Free Account</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 CareConnect. All rights reserved.</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
            <Text style={styles.footerSeparator}>•</Text>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroHeadline: {
    fontSize: isWeb ? 48 : 32,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: isWeb ? 56 : 40,
  },
  heroSubheadline: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
    maxWidth: 600,
    lineHeight: 26,
  },
  heroButtons: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  heroVisual: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center',
  },
  phonePreview: {
    opacity: 0.8,
  },
  dashboardPreview: {
    opacity: 0.6,
  },
  
  // Section Styles
  section: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  sectionTitle: {
    fontSize: isWeb ? 36 : 28,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: isWeb ? 44 : 36,
  },
  
  // Problem Section
  problemGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 24,
    justifyContent: 'center',
  },
  problemCard: {
    flex: isWeb ? 1 : undefined,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    maxWidth: isWeb ? 300 : undefined,
  },
  problemEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  problemTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  problemDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Solution Section
  solutionSection: {
    backgroundColor: '#F9FAFB',
  },
  stepsContainer: {
    gap: 32,
  },
  step: {
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
  },
  stepNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Features Section
  featuresContainer: {
    gap: 48,
  },
  featureCard: {
    flexDirection: isWeb ? 'row' : 'column',
    alignItems: 'center',
    gap: 24,
    maxWidth: 800,
    alignSelf: 'center',
  },
  featureCardReverse: {
    flexDirection: isWeb ? 'row-reverse' : 'column',
  },
  featureIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    alignItems: isWeb ? 'flex-start' : 'center',
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: isWeb ? 'left' : 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: isWeb ? 'left' : 'center',
  },
  
  // Testimonials Section
  testimonialsSection: {
    backgroundColor: '#F9FAFB',
  },
  testimonialsContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 32,
    justifyContent: 'center',
  },
  testimonialCard: {
    flex: isWeb ? 1 : undefined,
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: isWeb ? 400 : undefined,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  testimonialQuote: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 24,
  },
  testimonialAuthor: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  testimonialRelation: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Pricing Section
  pricingContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 32,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  pricingCard: {
    flex: isWeb ? 1 : undefined,
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    maxWidth: isWeb ? 400 : undefined,
    position: 'relative',
  },
  pricingCardPrimary: {
    borderColor: '#667eea',
    transform: [{ scale: isWeb ? 1.05 : 1 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  popularBadgeText: {
    backgroundColor: '#667eea',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 18,
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600' as const,
  },
  featuresList: {
    gap: 12,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  featureTextDisabled: {
    color: '#9CA3AF',
  },
  pricingButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pricingButtonPrimary: {
    backgroundColor: '#667eea',
  },
  pricingButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  pricingButtonTextPrimary: {
    color: '#FFFFFF',
  },
  
  // Final CTA Section
  finalCtaSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: isWeb ? 36 : 28,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: isWeb ? 44 : 36,
  },
  finalCtaSubtext: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    maxWidth: 600,
    lineHeight: 26,
  },
  finalCtaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  finalCtaButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    gap: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerLink: {
    fontSize: 14,
    color: '#667eea',
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    fontSize: 14,
    color: '#6B7280',
  },
});