import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

const testData = [
  {
    name: "Birth",
    description: "You were born",
    date: "1993-10-12",
    type: "birth"
  },
  {
    name: "Start Elementary School at Henderson Mill",
    description: "Description 1",
    date: "1998-05-01",
    type: "school"
  },
  {
    name: "Visit Ireland w/ Family",
    description: "spent 2 weeks traveling around visiting Dublin, Kilkenny and Dingle among others. Saw Cliffs of Moher and Book of Kells.",
    date: "2009-01-02",
    type: "travel"
  }
];

export const GET: APIRoute = async () => {
  try {
    console.log('Seeding test data...');
    const { data, error } = await supabase
      .from('events')
      .insert(testData)
      .select();

    if (error) {
      console.error('Failed to seed data:', error);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Failed to seed data',
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Successfully seeded data:', data);
    return new Response(JSON.stringify({
      status: 'success',
      message: 'Successfully seeded test data',
      data: data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Seed endpoint error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Unexpected error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 