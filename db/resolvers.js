const Usuario = require("../Models/Usuario");
const Proyecto = require("../Models/Proyecto");
const Tarea = require("../Models/Tarea");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });

//crea y firma un JWT
const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email, nombre } = usuario;

  return jwt.sign({ id, email, nombre }, secreta, { expiresIn });
};

// un resolver es una funcion
const resolvers = {
  // para obtener los datos siempre va dentro de un query
  // seria como un select en mysql
  Query: {
    obtenerProyectos: async (_, {}, ctx) => {
      const proyectos = await Proyecto.find({ creador: ctx.usuario.id });

      return proyectos;
    },
    obtenerTareas: async (_, {id, input}, ctx) => {
      const tareas = await Tarea.find({ creador: ctx.usuario.id}).where('proyecto').equals(input.proyecto);
      return tareas;

     }
  },
  Mutation: {
    // argumento primero es root
    // el segundo son los argumentos que se le pasan hacia este valor se recomienda pasar com objeto
    // el tercero se conoce como context
    // el 4 se le conoce como informacion
    crearUsuario: async (_, { input }) => {
      const { email, password } = input;

      const existeUsuario = await Usuario.findOne({ email });

      // si el usuario existe
      if (existeUsuario) {
        throw new Error("El usuario ya esta registrado");
      }

      try {
        // hashear password
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);

        const nuevoUsuario = new Usuario(input);
        // guardar en la base de datos
        nuevoUsuario.save();
        return "Usuario creado correctamente";
      } catch (error) {
        console.log(error);
      }
    },
    // segundo mutation
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      // si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });

      // si el usuario no existe
      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }

      // revisar si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error("password incorrecto");
      }
      // dar acceso a la app
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, "2hr"),
      };
    },

    nuevoProyecto: async (_, { input }, ctx) => {
      // console.log(ctx);
      try {
        const proyecto = new Proyecto(input);

        // asociar el creador
        proyecto.creador = ctx.usuario.id;

        // guardar en la BD, .save() para guardar en la bd mongo
        const resultado = await proyecto.save();

        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProyecto: async (_, { id, input }, ctx) => {
      // revisar si el proyecto existe o no
      let proyecto = await Proyecto.findById(id);

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }
      // revisar que si la persona que trata de editarlo es el creador
      if (proyecto.creador.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales para editar");
      }
      // guardar el proyecto
      proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, {
        new: true,
        useFindAndModify: false,
      });
      return proyecto;
    },
    eliminarProyecto: async (_, { id }, ctx) => {
      // revisar si el proyecto existe o no
      let proyecto = await Proyecto.findById(id);

      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }
      // revisar que si la persona que trata de editarlo es el creador
      if (proyecto.creador.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales para editar");
      }

      // eliminar Proyecto
      await Proyecto.findOneAndDelete({ _id: id});
      return "Proyecto eliminado"
    },

    nuevaTarea: async (_, {input}, ctx) => {
      console.log(input)
      try {
        const tarea = new Tarea(input);
        tarea.creador = ctx.usuario.id;
        const resultado = await tarea.save();
        return resultado;

      } catch (error) {
        console.log(error)
      }
    },
    actualizarTarea: async (_, {id, input, estado}, ctx) => {
      // Si la tarea existe o no 
      let tarea = await Tarea.findById(id);

      if(!tarea) {
        throw new Error('Tarea no encontrada')
      }

      if(tarea.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales para editar');
      }

      // asignar el estado 
      input.estado = estado;
      // si la persona que edita es el creador

      // guardar y retornar la tarea
      tarea = await Tarea.findOneAndUpdate({_id: id}, input, {new: true});
      return tarea;
    },

    eliminarTarea: async (_, {id}, ctx) => {
     // Si la tarea existe o no 
     let tarea = await Tarea.findById(id);

     if(!tarea) {
       throw new Error('Tarea no encontrada')
     }

     if(tarea.creador.toString() !== ctx.usuario.id) {
       throw new Error('No tienes las credenciales para editar');
     }

     //eliminar
     await Tarea.findByIdAndDelete({_id: id})
     return "Tarea Eliminada";
    }
  },
};

module.exports = resolvers;
