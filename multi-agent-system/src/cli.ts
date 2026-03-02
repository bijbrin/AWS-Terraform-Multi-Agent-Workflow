import { Supervisor } from './supervisor';
import { AgentType } from './types';

async function main() {
  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const supervisor = new Supervisor();

  // Example query
  const query = process.argv[2] || 'Explain quantum computing and create a diagram';
  
  console.log('🔍 Query:', query);
  console.log('─'.repeat(50));

  try {
    const result = await supervisor.processQuery(query);

    console.log('\n📊 Results:');
    console.log('─'.repeat(50));

    for (const agentResult of result.results) {
      console.log(`\n🤖 ${agentResult.agentType.toUpperCase()}:`);
      console.log(agentResult.content.slice(0, 500));
      if (agentResult.content.length > 500) {
        console.log('... (truncated)');
      }
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      for (const error of result.errors) {
        console.log(`  - ${error.agentType}: ${error.message}`);
      }
    }

    console.log(`\n⏱️  Total duration: ${result.durationMs}ms`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
