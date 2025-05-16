import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Definir el enum Weekday para coincidir con el modelo de Prisma
type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

async function main() {
  try {
    console.log('Iniciando seed...');

    // Crear usuario
    const hashedPassword = await bcrypt.hash('ana2025', 10);
    
    const user = await prisma.user.upsert({
      where: { username: 'ana' },
      update: {},
      create: {
        username: 'ana',
        password: hashedPassword,
      },
    });

    console.log(`Usuario creado: ${user.username}`);

    // Crear rutina
    const routine = await prisma.routine.upsert({
      where: {
        name_userId: {
          name: 'Rutina Mayo',
          userId: user.id,
        },
      },
      update: {},
      create: {
        name: 'Rutina Mayo',
        userId: user.id,
      },
    });

    console.log(`Rutina creada: ${routine.name}`);

    // Definir ejercicios
    const exercises = [
      // Lunes
      'SENTADILLA LIBRE',
      'PESO MUERTO SEMI-UNILATERAL KB',
      'PRESS INCLINADO MANCUERNAS',
      'BAJADAS PARA PIERNAS GRAVITRON',
      'TIRONES POLEA ALTA BARRITA',
      'ABEDUCTOR POLEA BAJA CRUZO POR DETRÁS',
      'PARALELAS GRAVITRON',
      'ABDOMINALES OBLICUOS ROTACIÓN',
      'PLANCHA SOBRE PELOTA DE PILATES',
      
      // Martes
      'SENTADILLA BULGARA',
      'THRUSTER',
      'ABEDUCTOR BANDITA PARADA',
      'PRENSA 45º BIEN PROFUNDA',
      'REMO BARRA TOMA PALMAR',
      'AFONDO CON PRESS HOMBRO UNILATERAL BRAZO CONTRARIO',
      'LAGARTIJAS',
      'ABDOMINALES PIES ENGANCHADOS CON DISCO',
      'OBLICUOS FLEXIONES LATERALES',
      
      // Miércoles
      'HIPTHRUST',
      'BÍCEPS HOMBROS BARRA',
      'GLÚTEOS MAQUINA',
      'PRESS FRANCÉS COLCHONETA',
      'POSTERIORES MAQUINA ACOSTADA',
      'VUELO FRONTAL Y BÍCEPS ALTERNO AMBOS EN POSICIÓN MARTILLO',
      'SENTADILLA PIERNAS CERRADAS CON GEMELOS LANDMINE',
      'PRESS HORIZONTAL',
      'SILLA LUMBAR',
      'ABDOMINALES EN PARALELAS',
      
      // Jueves
      'CUADICEPS UNILATERAL',
      'DORSAL UNILATERAL EN DORSALERA',
      'PESO MUERTO BARRA',
      'PRESS VERTICAL AGARRANDO DEL CAÑO',
      'ADUCTOR MAQUINA TRONCO ADELANTADO',
      'TRÍCEPS PATADA MANCUERNAS',
      'GLÚTEOS POLEA BAJA CON AFONDO PIERNA CONTRARIA',
      'TRÍCEPS POLEA ALTA CUERDA',
      'PLANCHA TOCO HOMBROS',
      'PLANCHA LATERAL CON ROTACIÓN'
    ];

    // Crear ejercicios de forma única
    for (const exerciseName of exercises) {
      await prisma.exercise.upsert({
        where: { name: exerciseName },
        update: {},
        create: { name: exerciseName },
      });
    }

    console.log(`Ejercicios creados: ${exercises.length}`);

    // Estructura de los días y sus ejercicios
    const dayStructure = [
      {
        weekday: 'MONDAY',
        exercises: [
          'SENTADILLA LIBRE',
          'PESO MUERTO SEMI-UNILATERAL KB',
          'PRESS INCLINADO MANCUERNAS',
          'BAJADAS PARA PIERNAS GRAVITRON',
          'TIRONES POLEA ALTA BARRITA',
          'ABEDUCTOR POLEA BAJA CRUZO POR DETRÁS',
          'PARALELAS GRAVITRON',
          'ABDOMINALES OBLICUOS ROTACIÓN',
          'PLANCHA SOBRE PELOTA DE PILATES'
        ]
      },
      {
        weekday: 'TUESDAY',
        exercises: [
          'SENTADILLA BULGARA',
          'THRUSTER',
          'ABEDUCTOR BANDITA PARADA',
          'PRENSA 45º BIEN PROFUNDA',
          'REMO BARRA TOMA PALMAR',
          'AFONDO CON PRESS HOMBRO UNILATERAL BRAZO CONTRARIO',
          'LAGARTIJAS',
          'ABDOMINALES PIES ENGANCHADOS CON DISCO',
          'OBLICUOS FLEXIONES LATERALES'
        ]
      },
      {
        weekday: 'WEDNESDAY',
        exercises: [
          'HIPTHRUST',
          'BÍCEPS HOMBROS BARRA',
          'GLÚTEOS MAQUINA',
          'PRESS FRANCÉS COLCHONETA',
          'POSTERIORES MAQUINA ACOSTADA',
          'VUELO FRONTAL Y BÍCEPS ALTERNO AMBOS EN POSICIÓN MARTILLO',
          'SENTADILLA PIERNAS CERRADAS CON GEMELOS LANDMINE',
          'PRESS HORIZONTAL',
          'SILLA LUMBAR',
          'ABDOMINALES EN PARALELAS'
        ]
      },
      {
        weekday: 'THURSDAY',
        exercises: [
          'CUADICEPS UNILATERAL',
          'DORSAL UNILATERAL EN DORSALERA',
          'PESO MUERTO BARRA',
          'PRESS VERTICAL AGARRANDO DEL CAÑO',
          'ADUCTOR MAQUINA TRONCO ADELANTADO',
          'TRÍCEPS PATADA MANCUERNAS',
          'GLÚTEOS POLEA BAJA CON AFONDO PIERNA CONTRARIA',
          'TRÍCEPS POLEA ALTA CUERDA',
          'PLANCHA TOCO HOMBROS',
          'PLANCHA LATERAL CON ROTACIÓN'
        ]
      }
    ];

    // Crear días y asignar ejercicios
    for (const day of dayStructure) {
      // Crear el día de la semana
      const createdDay = await prisma.day.upsert({
        where: {
          weekday_routineId: {
            weekday: day.weekday as Weekday,
            routineId: routine.id
          }
        },
        update: {},
        create: {
          weekday: day.weekday as Weekday,
          routineId: routine.id
        }
      });

      console.log(`Día creado: ${day.weekday}`);

      // Añadir ejercicios al día
      for (const exerciseName of day.exercises) {
        const exercise = await prisma.exercise.findUnique({
          where: { name: exerciseName }
        });

        if (exercise) {
          await prisma.dayExercise.upsert({
            where: {
              dayId_exerciseId: {
                dayId: createdDay.id,
                exerciseId: exercise.id
              }
            },
            update: {},
            create: {
              dayId: createdDay.id,
              exerciseId: exercise.id
            }
          });
        }
      }

      console.log(`Ejercicios añadidos al día ${day.weekday}: ${day.exercises.length}`);
    }

    console.log('Seed completado con éxito');
  } catch (error) {
    console.error('Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 