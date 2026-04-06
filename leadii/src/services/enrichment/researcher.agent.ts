/**
 * Leadii - Researcher Agent
 * 
 * An autonomous AI agent that performs live web research on leads
 * to create comprehensive "Digital Dossiers" for personalized outreach.
 * 
 * @module services/enrichment/researcher.agent
 */

import { OpenAI } from 'openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { DynamicTool } from '@langchain/core/tools';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// Types
interface Lead {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  linkedInUrl?: string;
  website?: string;
  city?: string;
  state?: string;
  nicheType: 'B2B' | 'B2C';
}

interface ResearchResult {
  companyOverview: string;
  recentNews: NewsItem[];
  socialActivity: SocialActivity;
  painPoints: string[];
  opportunities: string[];
  triggerEvents: TriggerEvent[];
  personalizationHints: PersonalizationHints;
  conversationStarters: string[];
  confidenceScore: number;
  sourcesUsed: Source[];
  researchQueries: string[];
}

interface NewsItem {
  title: string;
  url: string;
  date: string;
  summary: string;
  relevance: number;
}

interface SocialActivity {
  linkedInPosts?: LinkedInPost[];
  tweets?: Tweet[];
  recentActivity: string;
}

interface LinkedInPost {
  content: string;
  date: string;
  engagement: number;
  url?: string;
}

interface Tweet {
  content: string;
  date: string;
  likes: number;
  url?: string;
}

interface TriggerEvent {
  type: string;
  description: string;
  date: string;
  source: string;
  outreachAngle: string;
}

interface PersonalizationHints {
  mutualInterests: string[];
  recentAchievements: string[];
  professionalChallenges: string[];
  communicationStyle: string;
  preferredTopics: string[];
  avoidTopics: string[];
}

interface Source {
  url: string;
  title: string;
  relevanceScore: number;
  accessedAt: string;
}

interface EnrichmentConfig {
  perplexityApiKey: string;
  openaiApiKey: string;
  anthropicApiKey?: string;
  maxResearchTimeMs: number;
  minConfidenceThreshold: number;
  enableSocialScraping: boolean;
  industryPromptModifier?: string;
}

// ============================================================================
// RESEARCHER AGENT CLASS
// ============================================================================

export class ResearcherAgent {
  private perplexity: OpenAI;
  private openai: OpenAI;
  private anthropic?: ChatAnthropic;
  private config: EnrichmentConfig;

  constructor(config: EnrichmentConfig) {
    this.config = config;
    
    // Perplexity for live web search
    this.perplexity = new OpenAI({
      apiKey: config.perplexityApiKey,
      baseURL: 'https://api.perplexity.ai',
    });

    // OpenAI for synthesis and copywriting
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });

    // Anthropic for complex reasoning (optional)
    if (config.anthropicApiKey) {
      this.anthropic = new ChatAnthropic({
        apiKey: config.anthropicApiKey,
        modelName: 'claude-3-opus-20240229',
      });
    }
  }

  /**
   * Main entry point: Research a lead and generate a comprehensive dossier
   */
  public async researchLead(lead: Lead): Promise<ResearchResult> {
    const startTime = Date.now();
    const queries = this.generateResearchQueries(lead);
    const sources: Source[] = [];

    try {
      // Phase 1: Live Web Research (Parallel)
      const [companyResearch, personResearch, newsResearch, socialResearch] = await Promise.all([
        this.researchCompany(lead, queries.companyQueries),
        this.researchPerson(lead, queries.personQueries),
        this.researchNews(lead, queries.newsQueries),
        this.config.enableSocialScraping ? this.researchSocial(lead) : Promise.resolve(null),
      ]);

      // Collect sources
      sources.push(
        ...companyResearch.sources,
        ...personResearch.sources,
        ...newsResearch.sources
      );

      // Phase 2: AI Synthesis
      const synthesis = await this.synthesizeResearch({
        lead,
        companyData: companyResearch,
        personData: personResearch,
        newsData: newsResearch,
        socialData: socialResearch,
      });

      // Phase 3: Generate Personalization
      const personalization = await this.generatePersonalization(lead, synthesis);

      // Phase 4: Calculate Confidence Score
      const confidenceScore = this.calculateConfidenceScore({
        sources: sources.length,
        dataCompleteness: synthesis,
        lead,
      });

      const processingTime = Date.now() - startTime;

      return {
        companyOverview: synthesis.companyOverview,
        recentNews: newsResearch.newsItems,
        socialActivity: socialResearch || { recentActivity: 'No social data available' },
        painPoints: synthesis.painPoints,
        opportunities: synthesis.opportunities,
        triggerEvents: synthesis.triggerEvents,
        personalizationHints: personalization.hints,
        conversationStarters: personalization.starters,
        confidenceScore,
        sourcesUsed: sources,
        researchQueries: [
          ...queries.companyQueries,
          ...queries.personQueries,
          ...queries.newsQueries,
        ],
      };
    } catch (error) {
      console.error('ResearcherAgent Error:', error);
      throw new ResearchError('Failed to complete lead research', { cause: error });
    }
  }

  /**
   * Generate targeted search queries based on lead profile
   */
  private generateResearchQueries(lead: Lead): {
    companyQueries: string[];
    personQueries: string[];
    newsQueries: string[];
  } {
    const companyQueries: string[] = [];
    const personQueries: string[] = [];
    const newsQueries: string[] = [];

    const { companyName, fullName, firstName, lastName, jobTitle, industry, city, state } = lead;
    const personName = fullName || `${firstName} ${lastName}`.trim();

    // B2B-specific queries
    if (lead.nicheType === 'B2B' && companyName) {
      companyQueries.push(
        `${companyName} company overview business model revenue`,
        `${companyName} recent news funding hiring 2024`,
        `${companyName} challenges pain points ${industry || ''}`,
        `${companyName} competitors market position`,
        `${companyName} ${city || ''} ${state || ''} office`
      );

      if (personName) {
        personQueries.push(
          `${personName} ${companyName} ${jobTitle || ''}`,
          `${personName} LinkedIn profile ${jobTitle || ''}`,
          `${personName} ${companyName} interview article`
        );
      }

      newsQueries.push(
        `${companyName} news today`,
        `${companyName} ${industry || 'industry'} trends`,
        `${companyName} expansion growth`
      );
    }

    // B2C-specific queries
    if (lead.nicheType === 'B2C' && personName) {
      personQueries.push(
        `${personName} ${city || ''} professional`,
        `${personName} ${jobTitle || ''} ${industry || ''}`,
        `${personName} social media LinkedIn`
      );

      newsQueries.push(
        `${industry || 'local'} trends ${city || ''} ${state || ''}`,
        `${jobTitle || 'professional'} challenges 2024`
      );
    }

    // Industry-specific modifiers
    if (this.config.industryPromptModifier) {
      companyQueries.push(this.config.industryPromptModifier);
    }

    return { companyQueries, personQueries, newsQueries };
  }

  /**
   * Research company information using Perplexity
   */
  private async researchCompany(
    lead: Lead,
    queries: string[]
  ): Promise<{
    overview: string;
    keyFacts: Record<string, string>;
    sources: Source[];
  }> {
    const searchQuery = queries.join(' | ');

    const response = await this.perplexity.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `You are a business intelligence researcher. Search the web for comprehensive information about the company. 
          Return a JSON object with:
          - overview: A 2-3 paragraph company overview
          - keyFacts: Object with keys like revenue, employees, founded, headquarters, ceo
          - sources: Array of URLs you used
          
          Be factual and cite specific numbers when available.`,
        },
        {
          role: 'user',
          content: `Research this company: ${searchQuery}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from Perplexity');

    const parsed = JSON.parse(content);

    return {
      overview: parsed.overview || '',
      keyFacts: parsed.keyFacts || {},
      sources: (parsed.sources || []).map((url: string) => ({
        url,
        title: 'Research Source',
        relevanceScore: 0.8,
        accessedAt: new Date().toISOString(),
      })),
    };
  }

  /**
   * Research person/executive information
   */
  private async researchPerson(
    lead: Lead,
    queries: string[]
  ): Promise<{
    profile: string;
    careerHistory: string[];
    interests: string[];
    sources: Source[];
  }> {
    const searchQuery = queries.join(' | ');

    const response = await this.perplexity.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `Research this professional person. Find their background, career history, interests, and any public content they've shared.
          Return JSON with:
          - profile: Professional summary
          - careerHistory: Array of career highlights
          - interests: Array of professional interests/topics
          - sources: Array of URLs`,
        },
        {
          role: 'user',
          content: `Research: ${searchQuery}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from Perplexity');

    const parsed = JSON.parse(content);

    return {
      profile: parsed.profile || '',
      careerHistory: parsed.careerHistory || [],
      interests: parsed.interests || [],
      sources: (parsed.sources || []).map((url: string) => ({
        url,
        title: 'Profile Source',
        relevanceScore: 0.75,
        accessedAt: new Date().toISOString(),
      })),
    };
  }

  /**
   * Research recent news and trigger events
   */
  private async researchNews(
    lead: Lead,
    queries: string[]
  ): Promise<{
    newsItems: NewsItem[];
    sources: Source[];
  }> {
    const searchQuery = queries.join(' | ');

    const response = await this.perplexity.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `Find recent news (last 6 months) about this company or person. Look for funding, acquisitions, hiring, expansions, awards, or challenges.
          Return JSON with:
          - newsItems: Array of {title, url, date, summary, relevance (0-1)}
          - sources: Array of URLs`,
        },
        {
          role: 'user',
          content: `Find recent news: ${searchQuery}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from Perplexity');

    const parsed = JSON.parse(content);

    return {
      newsItems: (parsed.newsItems || []).map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        date: item.date || new Date().toISOString(),
        summary: item.summary || '',
        relevance: item.relevance || 0.5,
      })),
      sources: (parsed.sources || []).map((url: string) => ({
        url,
        title: 'News Source',
        relevanceScore: 0.9,
        accessedAt: new Date().toISOString(),
      })),
    };
  }

  /**
   * Research social media activity (if enabled)
   */
  private async researchSocial(lead: Lead): Promise<SocialActivity | null> {
    if (!lead.linkedInUrl) return null;

    // Note: Actual social scraping would require additional services
    // like Proxycurl, PhantomBuster, or similar
    // This is a placeholder for the architecture

    return {
      recentActivity: 'Social research enabled but requires external service integration',
    };
  }

  /**
   * Synthesize all research into actionable insights
   */
  private async synthesizeResearch(data: {
    lead: Lead;
    companyData: any;
    personData: any;
    newsData: any;
    socialData: SocialActivity | null;
  }): Promise<{
    companyOverview: string;
    painPoints: string[];
    opportunities: string[];
    triggerEvents: TriggerEvent[];
  }> {
    const model =
      this.anthropic ||
      new ChatOpenAI({
        openAIApiKey: this.config.openaiApiKey,
        modelName: 'gpt-4-turbo-preview',
      });

    const synthesisPrompt = PromptTemplate.fromTemplate(`
You are an expert sales intelligence analyst. Synthesize the following research data into actionable insights.

LEAD PROFILE:
- Name: {personName}
- Company: {companyName}
- Title: {jobTitle}
- Industry: {industry}
- Type: {nicheType}

COMPANY RESEARCH:
{companyResearch}

PERSON RESEARCH:
{personResearch}

RECENT NEWS:
{newsResearch}

SOCIAL ACTIVITY:
{socialResearch}

TASK:
1. Write a compelling 2-paragraph company overview
2. Identify 3-5 specific pain points this person/company likely faces
3. Identify 3-5 opportunities where our solution could help
4. Extract any trigger events (funding, hiring, expansion, challenges) with outreach angles

Return valid JSON:
{{
  "companyOverview": "string",
  "painPoints": ["string"],
  "opportunities": ["string"],
  "triggerEvents": [
    {{
      "type": "string",
      "description": "string",
      "date": "string",
      "source": "string",
      "outreachAngle": "string"
    }}
  ]
}}
`);

    const chain = RunnableSequence.from([
      synthesisPrompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      personName: data.lead.fullName || `${data.lead.firstName} ${data.lead.lastName}`,
      companyName: data.lead.companyName || 'N/A',
      jobTitle: data.lead.jobTitle || 'N/A',
      industry: data.lead.industry || 'N/A',
      nicheType: data.lead.nicheType,
      companyResearch: JSON.stringify(data.companyData, null, 2),
      personResearch: JSON.stringify(data.personData, null, 2),
      newsResearch: JSON.stringify(data.newsData, null, 2),
      socialResearch: JSON.stringify(data.socialData, null, 2),
    });

    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse synthesis result');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Generate personalization hints and conversation starters
   */
  private async generatePersonalization(
    lead: Lead,
    synthesis: any
  ): Promise<{
    hints: PersonalizationHints;
    starters: string[];
  }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert sales copywriter. Based on the research synthesis, create personalization data.
          
          Return JSON with:
          - hints: {
              mutualInterests: [],
              recentAchievements: [],
              professionalChallenges: [],
              communicationStyle: "(formal/casual/direct)",
              preferredTopics: [],
              avoidTopics: []
            }
          - starters: Array of 3-5 personalized conversation openers (1-2 sentences each)`,
        },
        {
          role: 'user',
          content: `Lead: ${lead.fullName} at ${lead.companyName}
          
          Synthesis: ${JSON.stringify(synthesis, null, 2)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const parsed = JSON.parse(content);

    return {
      hints: parsed.hints || {
        mutualInterests: [],
        recentAchievements: [],
        professionalChallenges: [],
        communicationStyle: 'professional',
        preferredTopics: [],
        avoidTopics: [],
      },
      starters: parsed.starters || [],
    };
  }

  /**
   * Calculate confidence score for the enrichment
   */
  private calculateConfidenceScore(data: {
    sources: number;
    dataCompleteness: any;
    lead: Lead;
  }): number {
    let score = 0;

    // Source diversity (max 30 points)
    score += Math.min(data.sources * 5, 30);

    // Data completeness (max 40 points)
    if (data.dataCompleteness.companyOverview) score += 15;
    if (data.dataCompleteness.painPoints?.length > 0) score += 15;
    if (data.dataCompleteness.opportunities?.length > 0) score += 10;

    // Lead data quality (max 30 points)
    if (data.lead.linkedInUrl) score += 10;
    if (data.lead.companyName) score += 10;
    if (data.lead.jobTitle) score += 10;

    return Math.min(score / 100, 1);
  }

  /**
   * Generate suggested copy for outreach
   */
  public async generateOutreachCopy(
    lead: Lead,
    research: ResearchResult,
    channel: 'email' | 'linkedin' | 'sms' | 'whatsapp'
  ): Promise<{ subject?: string; body: string }> {
    const channelGuidelines = {
      email: 'Professional, 3-4 paragraphs, clear CTA',
      linkedin: 'Conversational, 2-3 short paragraphs, soft CTA',
      sms: 'Very brief, under 160 characters, no links in first message',
      whatsapp: 'Friendly, 1-2 paragraphs, emoji optional',
    };

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert sales copywriter. Write a personalized outreach message.
          
          Guidelines for ${channel}: ${channelGuidelines[channel]}
          
          Use the research insights to craft a highly personalized message.
          Reference specific details from the dossier.
          Focus on their pain points and opportunities.
          
          Return JSON: { "subject": "string (if applicable)", "body": "string" }`,
        },
        {
          role: 'user',
          content: `
Lead: ${lead.fullName}, ${lead.jobTitle} at ${lead.companyName}

Research Dossier:
${JSON.stringify(research, null, 2)}

Write a ${channel} message:`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return JSON.parse(content);
  }
}

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

class ResearchError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ResearchError';
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createResearcherAgent(config: EnrichmentConfig): ResearcherAgent {
  return new ResearcherAgent(config);
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
const agent = createResearcherAgent({
  perplexityApiKey: process.env.PERPLEXITY_API_KEY!,
  openaiApiKey: process.env.OPENAI_API_KEY!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  maxResearchTimeMs: 60000,
  minConfidenceThreshold: 0.6,
  enableSocialScraping: true,
});

const lead: Lead = {
  id: 'lead_123',
  firstName: 'John',
  lastName: 'Smith',
  companyName: 'Acme Corp',
  jobTitle: 'VP of Sales',
  industry: 'SaaS',
  linkedInUrl: 'https://linkedin.com/in/johnsmith',
  city: 'San Francisco',
  state: 'CA',
  nicheType: 'B2B',
};

const dossier = await agent.researchLead(lead);
console.log('Research complete:', dossier.confidenceScore);
console.log('Pain points:', dossier.painPoints);
console.log('Conversation starters:', dossier.conversationStarters);

const emailCopy = await agent.generateOutreachCopy(lead, dossier, 'email');
console.log('Suggested email:', emailCopy);
*/
