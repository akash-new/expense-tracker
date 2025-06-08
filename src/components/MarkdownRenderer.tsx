"use client";

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Convert markdown to HTML
  const htmlContent = React.useMemo(() => {
    let html = content;
    
    // Track if we are inside a list
    let inUnorderedList = false;
    let inOrderedList = false;
    
    // Process by lines for better control over list contexts
    const lines = html.split('\n');
    const processedLines = lines.map((line, index) => {
      let processed = line;
      
      // Process headings
      if (processed.match(/^# (.*$)/)) {
        return processed.replace(/^# (.*$)/, '<h1>$1</h1>');
      }
      
      if (processed.match(/^## (.*$)/)) {
        return processed.replace(/^## (.*$)/, '<h2>$1</h2>');
      }
      
      if (processed.match(/^### (.*$)/)) {
        return processed.replace(/^### (.*$)/, '<h3>$1</h3>');
      }
      
      // Process unordered list items
      if (processed.match(/^\s*-\s(.*$)/)) {
        const listItem = processed.replace(/^\s*-\s(.*)$/, '$1');
        
        // If we weren't in a list before, start a new one
        if (!inUnorderedList) {
          inUnorderedList = true;
          inOrderedList = false;
          return `<ul><li>${listItem}</li>`;
        }
        
        // If we were already in an unordered list, just add the item
        return `<li>${listItem}</li>`;
      }
      
      // Process ordered list items
      if (processed.match(/^\s*\d+\.\s(.*$)/)) {
        const listItem = processed.replace(/^\s*\d+\.\s(.*)$/, '$1');
        
        // If we weren't in a list before, start a new one
        if (!inOrderedList) {
          inOrderedList = true;
          inUnorderedList = false;
          return `<ol><li>${listItem}</li>`;
        }
        
        // If we were already in an ordered list, just add the item
        return `<li>${listItem}</li>`;
      }
      
      // If we're not a list item but we were in a list, close it
      if (inUnorderedList && !processed.match(/^\s*-\s(.*$)/)) {
        inUnorderedList = false;
        // Only add paragraph if there's content (not empty line)
        if (processed.trim()) {
          return `</ul><p>${processed}</p>`;
        } else {
          return '</ul>';
        }
      }
      
      if (inOrderedList && !processed.match(/^\s*\d+\.\s(.*$)/)) {
        inOrderedList = false;
        // Only add paragraph if there's content (not empty line)
        if (processed.trim()) {
          return `</ol><p>${processed}</p>`;
        } else {
          return '</ol>';
        }
      }
      
      // Process paragraphs (for non-empty lines)
      if (processed.trim() && !processed.startsWith('<')) {
        return `<p>${processed}</p>`;
      }
      
      // Return as is if it's an empty line
      return processed;
    });
    
    // Close any open lists at the end
    if (inUnorderedList) {
      processedLines.push('</ul>');
    } else if (inOrderedList) {
      processedLines.push('</ol>');
    }
    
    // Join processed lines back to HTML
    html = processedLines.join('\n');
    
    // Process inline formatting
    html = html
      // Process bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Process italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Process links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Process code blocks (fenced with ```)
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      
      // Process inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return html;
  }, [content]);
  
  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
} 