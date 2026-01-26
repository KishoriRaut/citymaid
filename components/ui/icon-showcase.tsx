"use client";

import { 
  Home, 
  User, 
  Settings, 
  Search, 
  Bell, 
  Heart, 
  Star, 
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  DollarSign,
  CreditCard,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Filter
} from "lucide-react";

interface IconShowcaseProps {
  className?: string;
}

export default function IconShowcase({ className = "" }: IconShowcaseProps) {
  const iconCategories = [
    {
      title: "Navigation",
      icons: [
        { component: Home, name: "Home" },
        { component: ChevronLeft, name: "ChevronLeft" },
        { component: ChevronRight, name: "ChevronRight" },
        { component: ChevronDown, name: "ChevronDown" },
      ]
    },
    {
      title: "Actions",
      icons: [
        { component: Plus, name: "Plus" },
        { component: Edit, name: "Edit" },
        { component: Trash2, name: "Trash2" },
        { component: Search, name: "Search" },
        { component: Filter, name: "Filter" },
        { component: MoreVertical, name: "MoreVertical" },
      ]
    },
    {
      title: "User & Account",
      icons: [
        { component: User, name: "User" },
        { component: Settings, name: "Settings" },
        { component: Shield, name: "Shield" },
        { component: Lock, name: "Lock" },
        { component: Unlock, name: "Unlock" },
      ]
    },
    {
      title: "Status & Feedback",
      icons: [
        { component: CheckCircle, name: "CheckCircle" },
        { component: XCircle, name: "XCircle" },
        { component: AlertCircle, name: "AlertCircle" },
        { component: Eye, name: "Eye" },
        { component: EyeOff, name: "EyeOff" },
      ]
    },
    {
      title: "Communication",
      icons: [
        { component: Phone, name: "Phone" },
        { component: Mail, name: "Mail" },
        { component: MessageSquare, name: "MessageSquare" },
        { component: Bell, name: "Bell" },
      ]
    },
    {
      title: "Business & Finance",
      icons: [
        { component: DollarSign, name: "DollarSign" },
        { component: CreditCard, name: "CreditCard" },
        { component: TrendingUp, name: "TrendingUp" },
        { component: BarChart3, name: "BarChart3" },
      ]
    },
    {
      title: "Time & Location",
      icons: [
        { component: Calendar, name: "Calendar" },
        { component: Clock, name: "Clock" },
        { component: MapPin, name: "MapPin" },
      ]
    },
    {
      title: "Media & Files",
      icons: [
        { component: Download, name: "Download" },
        { component: Upload, name: "Upload" },
        { component: RefreshCw, name: "RefreshCw" },
        { component: ExternalLink, name: "ExternalLink" },
      ]
    },
    {
      title: "Social",
      icons: [
        { component: Heart, name: "Heart" },
        { component: Star, name: "Star" },
      ]
    },
  ];

  return (
    <div className={`p-6 bg-background ${className}`}>
      <h2 className="text-2xl font-bold mb-6">Lucide Icon Showcase</h2>
      
      <div className="space-y-8">
        {iconCategories.map((category) => (
          <div key={category.title}>
            <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
              {category.title}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.icons.map((icon) => {
                const IconComponent = icon.component;
                return (
                  <div
                    key={icon.name}
                    className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <IconComponent className="w-8 h-8 mb-2 text-primary" />
                    <span className="text-xs text-center">{icon.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
