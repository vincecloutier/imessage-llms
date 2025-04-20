import { getPersonaById } from "@/db/cached-queries";
import { deletePersonaById } from "@/db/mutations";
import { getSession } from "@/db/cached-queries";
import { savePersona } from "@/db/mutations";

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
  
    if (!id) {
      return new Response('Not Found', { status: 404 });
    }
  
    const user = await getSession();
  
    try {
      const persona = await getPersonaById(id);
  
      if (!persona) {
        return new Response('Persona not found', { status: 404 });
      }
  
      if (persona.user_id !== user?.id) {
        return new Response('Unauthorized', { status: 401 });
      }
  
      await deletePersonaById(id, user?.id);
  
      return new Response('Persona deleted', { status: 200 });
    } catch (error) {
      console.error('Error deleting persona:', error);
      return new Response('An error occurred while processing your request', {
        status: 500,
      });
    }
  }
  
// create/update persona
export async function POST(request: Request) {
    const { id, persona } = await request.json();
  
    const user = await getSession();
  
    try {
      if (!user) {
        return new Response('Unauthorized', { status: 401 });
      }
  
    await savePersona(id, user.id, persona);
    
    return new Response('Persona Saved', { status: 200 });
    
    } catch (error) {
      console.error('Error saving persona:', error);
      return new Response('An error occurred while processing your request', {
        status: 500,
      });
    }
  }