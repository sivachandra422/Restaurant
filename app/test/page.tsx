'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">UI Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Button Test */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Buttons</h3>
              <div className="space-y-3">
                <Button>Default Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="destructive">Destructive Button</Button>
              </div>
            </CardContent>
          </Card>

          {/* Input Test */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Inputs</h3>
              <div className="space-y-3">
                <Input placeholder="Enter text..." />
                <Input type="email" placeholder="Enter email..." />
                <Input type="password" placeholder="Enter password..." />
              </div>
            </CardContent>
          </Card>

          {/* Select Test */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Select</h3>
              <div className="space-y-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Badge Test */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Badges</h3>
              <div className="space-y-3">
                <Badge>Default Badge</Badge>
                <Badge variant="secondary">Secondary Badge</Badge>
                <Badge variant="destructive">Destructive Badge</Badge>
                <Badge variant="outline">Outline Badge</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Grid Test */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Grid Layout</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-100 p-2 text-center">1</div>
                <div className="bg-blue-100 p-2 text-center">2</div>
                <div className="bg-blue-100 p-2 text-center">3</div>
                <div className="bg-blue-100 p-2 text-center">4</div>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Test */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Responsive Text</h3>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm md:text-base lg:text-lg">Responsive text that scales</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl">Larger responsive text</p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl">Even larger text</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Test */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Color System</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-primary text-primary-foreground p-4 rounded text-center">Primary</div>
              <div className="bg-secondary text-secondary-foreground p-4 rounded text-center">Secondary</div>
              <div className="bg-muted text-muted-foreground p-4 rounded text-center">Muted</div>
              <div className="bg-accent text-accent-foreground p-4 rounded text-center">Accent</div>
              <div className="bg-destructive text-destructive-foreground p-4 rounded text-center">Destructive</div>
              <div className="bg-card text-card-foreground p-4 rounded text-center border">Card</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 