# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM imbios/bun-node as base
WORKDIR /data/next-admin

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY . /temp/dev/
RUN cd /temp/dev && bun install 
 

# # install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json bun.lockb /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production

# # copy node_modules from temp directory
# # then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/ /data/next-admin/
RUN cd /data/next-admin/packages/server && npx prisma generate

# # [optional] tests & build
# # ENV NODE_ENV=production
# # RUN bun test
# # RUN bun run build

# # copy production dependencies and source code into final image
# FROM base AS release
# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=prerelease /usr/src/app/index.ts .
# COPY --from=prerelease /usr/src/app/package.json .

# # run the app
EXPOSE 3000 3001
ENTRYPOINT [ "bun", "run", "all"]

# FROM imbios/bun-node 
# WORKDIR /data/next-admin
# COPY . /data/next-admin
# RUN bun i
# RUN npx prisma generate
# EXPOSE 3000 4000
# ENTRYPOINT [ "bun", "run", "all"]
