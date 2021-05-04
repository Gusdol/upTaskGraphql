const { gql } = require("apollo-server");

// se recomienda usar el titulo como schema.js
// se crea un type definition como typeDefs
// estos typeDefs empieza con type y se agrega Query en la llave las consultas o query
// resolver es lo que se conecta con el schema o base de datos
const typeDefs = gql`

    type Token {
        token: String
    }

    type Proyecto {
        nombre: String
        id: ID
    }

    type Tarea {
        nombre: String
        id: ID
        proyecto: String
        estado: Boolean
    }

    type Query {
        obtenerProyectos: [Proyecto]

        obtenerTareas(input: ProyectoIDInput) : [Tarea]
    }

    input ProyectoIDInput {
        proyecto: String!
    }

    input UsuarioInput {
        nombre: String!
        email: String!
        password: String!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    input ProyectoInput {
        nombre : String!
    }

    input TareaInput {
        nombre: String!
        proyecto: String
    }

    type Mutation {

        #Usuarios
        crearUsuario(input: UsuarioInput) : String
        autenticarUsuario(input: AutenticarInput) : Token
        
        #Proyectos
        nuevoProyecto(input: ProyectoInput) : Proyecto
        actualizarProyecto(id: ID!, input: ProyectoInput) : Proyecto
        eliminarProyecto(id: ID!) : String

        #Tareas
        nuevaTarea(input: TareaInput) : Tarea
        actualizarTarea(id: ID!, input: TareaInput, estado: Boolean) : Tarea
        eliminarTarea(id: ID!) : String
    }
`;

module.exports = typeDefs;